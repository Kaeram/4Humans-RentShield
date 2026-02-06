"""
Pydantic models for request/response validation.

This module exports all request and response models used by the API.
"""

from app.models.requests import (
    BatchClassificationRequest,
    CaseAnalysisRequest,
    EvidenceItem,
    IssueClassificationRequest,
    PropertyHistory,
)
from app.models.responses import (
    AlignmentAnalysis,
    DAORecommendation,
    ErrorResponse,
    EvidenceEvaluation,
    EvidenceValidation,
    EXIFData,
    FraudAnalysis,
    HealthCheck,
    IssueClassification,
    LandlordPosition,
    PositionAnalysis,
    RedFlags,
    TamperAnalysis,
    TenantPosition,
)

__all__ = [
    # Requests
    "IssueClassificationRequest",
    "CaseAnalysisRequest",
    "BatchClassificationRequest",
    "EvidenceItem",
    "PropertyHistory",
    # Responses
    "IssueClassification",
    "EvidenceValidation",
    "EXIFData",
    "TamperAnalysis",
    "AlignmentAnalysis",
    "DAORecommendation",
    "FraudAnalysis",
    "HealthCheck",
    "ErrorResponse",
    "TenantPosition",
    "LandlordPosition",
    "PositionAnalysis",
    "EvidenceEvaluation",
    "RedFlags",
]
