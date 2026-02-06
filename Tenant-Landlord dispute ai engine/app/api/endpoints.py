"""
API Endpoints for RentShield AI Analysis Engine.

Provides all HTTP endpoints for issue classification, evidence validation,
case analysis, and health checks.
"""

import os
import shutil
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Optional
from uuid import uuid4

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse

from app import __version__
from app.config import get_settings
from app.models.requests import (
    BatchClassificationRequest,
    CaseAnalysisRequest,
    IssueClassificationRequest,
)
from app.models.responses import (
    BatchClassificationResponse,
    DAORecommendation,
    ErrorResponse,
    EvidenceValidation,
    HealthCheck,
    IssueClassification,
)
from app.services.case_analyzer import DisputeCaseAnalyzer
from app.services.evidence_validator import EvidenceValidator
from app.services.llm_service import OllamaLLMService
from app.utils.exceptions import (
    AnalysisError,
    ExifExtractionError,
    InvalidImageError,
    LLMConnectionError,
    LLMTimeoutError,
    RentShieldBaseException,
)
from app.utils.logger import get_logger, get_request_id, set_request_id

logger = get_logger(__name__)
router = APIRouter()


def get_llm_service() -> OllamaLLMService:
    """Get LLM service instance."""
    return OllamaLLMService()


def get_evidence_validator() -> EvidenceValidator:
    """Get evidence validator instance."""
    return EvidenceValidator()


def get_case_analyzer() -> DisputeCaseAnalyzer:
    """Get case analyzer instance."""
    return DisputeCaseAnalyzer(get_llm_service())


# ============================================================================
# Health Check
# ============================================================================

@router.get(
    "/health",
    response_model=HealthCheck,
    summary="Health Check",
    description="Check service health and LLM connection status.",
    tags=["Health"],
)
async def health_check() -> HealthCheck:
    """
    Health check endpoint.
    
    Returns service status, LLM connection status, and API version.
    
    Example:
        GET /health
        
        Response:
        {
            "status": "healthy",
            "llm_connected": true,
            "version": "1.0.0",
            "model_available": "mistral"
        }
    """
    llm_service = get_llm_service()
    llm_connected = llm_service.test_connection()
    model_available = llm_service.get_available_model() if llm_connected else None
    
    return HealthCheck(
        status="healthy" if llm_connected else "degraded",
        llm_connected=llm_connected,
        version=__version__,
        model_available=model_available,
    )


# ============================================================================
# Issue Classification
# ============================================================================

@router.post(
    "/api/v1/classify-issue",
    response_model=IssueClassification,
    summary="Classify Issue",
    description="Classify a tenant issue by category, severity, and urgency.",
    tags=["Classification"],
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Analysis error"},
        504: {"model": ErrorResponse, "description": "LLM timeout"},
    },
)
async def classify_issue(
    request: IssueClassificationRequest,
) -> IssueClassification:
    """
    Classify a tenant issue.
    
    Analyzes the issue description and returns:
    - Primary category (Safety, Maintenance, Harassment, Discrimination)
    - Severity level (low, medium, high, critical)
    - Urgency flag
    - Confidence score
    
    Example:
        POST /api/v1/classify-issue
        {
            "description": "Water leak from ceiling causing mold growth",
            "evidence_count": 3
        }
    """
    request_id = set_request_id()
    
    logger.info(
        "Classify issue request received",
        description_length=len(request.description),
        evidence_count=request.evidence_count,
    )
    
    try:
        analyzer = get_case_analyzer()
        classification = analyzer.classify_issue(
            description=request.description,
            evidence_count=request.evidence_count,
        )
        classification.request_id = request_id
        return classification
        
    except LLMTimeoutError as e:
        logger.error("LLM timeout during classification", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=e.to_dict(),
        )
    except LLMConnectionError as e:
        logger.error("LLM connection error during classification", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=e.to_dict(),
        )
    except AnalysisError as e:
        logger.error("Analysis error during classification", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=e.to_dict(),
        )
    except Exception as e:
        logger.error("Unexpected error during classification", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "internal_error",
                "message": str(e),
                "request_id": request_id,
            },
        )


# ============================================================================
# Evidence Validation
# ============================================================================

@router.post(
    "/api/v1/validate-evidence",
    response_model=EvidenceValidation,
    summary="Validate Evidence",
    description="Validate image evidence authenticity using EXIF analysis.",
    tags=["Evidence"],
    responses={
        400: {"model": ErrorResponse, "description": "Invalid image"},
        500: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def validate_evidence(
    image: UploadFile = File(..., description="Image file (JPG/PNG, max 10MB)"),
    claim_text: Optional[str] = Form(None, description="Claim to verify against"),
    incident_date: Optional[str] = Form(None, description="ISO datetime of incident"),
) -> EvidenceValidation:
    """
    Validate image evidence.
    
    Analyzes an uploaded image and returns:
    - EXIF metadata
    - Authenticity score
    - Tampering analysis
    - Evidence-claim alignment (if claim provided)
    
    Example:
        POST /api/v1/validate-evidence
        Content-Type: multipart/form-data
        
        image: [file]
        claim_text: "Water damage in kitchen"
        incident_date: "2024-01-15T00:00:00Z"
    """
    request_id = set_request_id()
    settings = get_settings()
    
    logger.info(
        "Validate evidence request received",
        filename=image.filename,
        content_type=image.content_type,
        has_claim=claim_text is not None,
    )
    
    # Validate file type
    if image.filename:
        ext = Path(image.filename).suffix.lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "invalid_file_type",
                    "message": f"Invalid file type. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}",
                    "request_id": request_id,
                },
            )
    
    # Create temp file
    temp_path = None
    try:
        # Save uploaded file to temp location
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=Path(image.filename or "image.jpg").suffix,
        ) as temp_file:
            shutil.copyfileobj(image.file, temp_file)
            temp_path = temp_file.name
        
        # Validate file size
        file_size = os.path.getsize(temp_path)
        if file_size > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "file_too_large",
                    "message": f"File too large. Max size: {settings.MAX_FILE_SIZE // (1024*1024)}MB",
                    "request_id": request_id,
                },
            )
        
        # Parse incident date if provided
        parsed_incident_date = None
        if incident_date:
            try:
                parsed_incident_date = datetime.fromisoformat(
                    incident_date.replace("Z", "+00:00")
                )
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={
                        "error": "invalid_date_format",
                        "message": "incident_date must be ISO format",
                        "request_id": request_id,
                    },
                )
        
        # Perform validation
        validator = get_evidence_validator()
        llm_service = get_llm_service() if claim_text else None
        
        validation = validator.validate_evidence(
            image_path=temp_path,
            claim_text=claim_text,
            incident_date=parsed_incident_date,
            llm_service=llm_service,
        )
        validation.request_id = request_id
        
        return validation
        
    except InvalidImageError as e:
        logger.error("Invalid image error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.to_dict(),
        )
    except ExifExtractionError as e:
        logger.error("EXIF extraction error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=e.to_dict(),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Unexpected error during evidence validation", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "internal_error",
                "message": str(e),
                "request_id": request_id,
            },
        )
    finally:
        # Cleanup temp file
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except Exception as e:
                logger.warning("Failed to cleanup temp file", error=str(e))


# ============================================================================
# Case Analysis
# ============================================================================

@router.post(
    "/api/v1/analyze-case",
    response_model=DAORecommendation,
    summary="Analyze Case",
    description="Perform comprehensive dispute analysis for DAO recommendation.",
    tags=["Analysis"],
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Analysis error"},
        504: {"model": ErrorResponse, "description": "LLM timeout"},
    },
)
async def analyze_case(
    request: CaseAnalysisRequest,
) -> DAORecommendation:
    """
    Analyze a complete dispute case.
    
    Performs comprehensive analysis including:
    - Tenant position assessment
    - Landlord position assessment
    - Evidence evaluation
    - DAO voting recommendation
    - Red flag detection
    
    Example:
        POST /api/v1/analyze-case
        {
            "issue_id": "case-123",
            "tenant_complaint": "Heating broken for 3 weeks...",
            "landlord_response": "We scheduled repairs...",
            "incident_date": "2024-01-10T00:00:00Z",
            "tenant_evidence": [...],
            "landlord_evidence": [...]
        }
    """
    request_id = set_request_id()
    
    logger.info(
        "Analyze case request received",
        case_id=request.issue_id,
        tenant_evidence_count=len(request.tenant_evidence),
        landlord_evidence_count=len(request.landlord_evidence),
    )
    
    try:
        analyzer = get_case_analyzer()
        recommendation = analyzer.analyze_dispute(request)
        recommendation.request_id = request_id
        return recommendation
        
    except LLMTimeoutError as e:
        logger.error("LLM timeout during case analysis", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=e.to_dict(),
        )
    except LLMConnectionError as e:
        logger.error("LLM connection error during case analysis", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=e.to_dict(),
        )
    except AnalysisError as e:
        logger.error("Analysis error during case analysis", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=e.to_dict(),
        )
    except Exception as e:
        logger.error("Unexpected error during case analysis", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "internal_error",
                "message": str(e),
                "request_id": request_id,
            },
        )


# ============================================================================
# Batch Classification
# ============================================================================

@router.post(
    "/api/v1/batch-classify",
    response_model=BatchClassificationResponse,
    summary="Batch Classify Issues",
    description="Classify multiple issues in a single request.",
    tags=["Classification"],
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Analysis error"},
    },
)
async def batch_classify(
    request: BatchClassificationRequest,
) -> BatchClassificationResponse:
    """
    Classify multiple issues in batch.
    
    Processes up to 50 issues in a single request.
    
    Example:
        POST /api/v1/batch-classify
        {
            "issues": [
                {"description": "Water leak...", "evidence_count": 2},
                {"description": "Noise complaint...", "evidence_count": 0}
            ]
        }
    """
    request_id = set_request_id()
    
    logger.info(
        "Batch classify request received",
        issue_count=len(request.issues),
    )
    
    try:
        analyzer = get_case_analyzer()
        results: list[IssueClassification] = []
        
        for issue in request.issues:
            try:
                classification = analyzer.classify_issue(
                    description=issue.description,
                    evidence_count=issue.evidence_count,
                )
                results.append(classification)
            except Exception as e:
                logger.warning(
                    "Failed to classify issue in batch",
                    error=str(e),
                )
                # Add a placeholder for failed classifications
                from app.models.responses import IssueCategoryEnum, SeverityEnum
                results.append(
                    IssueClassification(
                        primary_category=IssueCategoryEnum.MAINTENANCE,
                        confidence=0,
                        severity=SeverityEnum.MEDIUM,
                        reasoning=f"Classification failed: {str(e)}",
                        urgency_flag=False,
                        keywords_detected=[],
                    )
                )
        
        return BatchClassificationResponse(
            results=results,
            total_processed=len(results),
            request_id=request_id,
        )
        
    except Exception as e:
        logger.error("Unexpected error during batch classification", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "internal_error",
                "message": str(e),
                "request_id": request_id,
            },
        )
