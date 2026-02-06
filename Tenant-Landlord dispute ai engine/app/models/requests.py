"""
Pydantic request models for RentShield AI Analysis Engine API.

All request models include validation, descriptions, and examples
for automatic OpenAPI documentation generation.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class IssueClassificationRequest(BaseModel):
    """
    Request model for issue classification endpoint.
    
    Example:
        >>> request = IssueClassificationRequest(
        ...     description="Water leak from ceiling causing mold",
        ...     evidence_count=3
        ... )
    """
    
    description: str = Field(
        ...,
        min_length=10,
        max_length=5000,
        description="Detailed description of the tenant's issue or complaint",
        json_schema_extra={
            "example": "Water has been leaking from the ceiling for 2 weeks causing mold growth. Landlord has not responded to repair requests."
        },
    )
    evidence_count: int = Field(
        default=0,
        ge=0,
        le=50,
        description="Number of evidence items (photos, documents) provided",
        json_schema_extra={"example": 3},
    )
    
    @field_validator("description")
    @classmethod
    def validate_description(cls, v: str) -> str:
        """Strip whitespace and ensure non-empty content."""
        v = v.strip()
        if not v:
            raise ValueError("Description cannot be empty or whitespace only")
        return v


class PropertyHistory(BaseModel):
    """
    Property complaint history for context in case analysis.
    
    Example:
        >>> history = PropertyHistory(previous_complaints=5, resolution_rate=0.8)
    """
    
    previous_complaints: int = Field(
        default=0,
        ge=0,
        description="Number of previous complaints at this property",
        json_schema_extra={"example": 5},
    )
    resolution_rate: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Rate of successfully resolved complaints (0.0-1.0)",
        json_schema_extra={"example": 0.75},
    )


class EvidenceItem(BaseModel):
    """
    Evidence item metadata for case analysis.
    
    Example:
        >>> evidence = EvidenceItem(
        ...     file_url="https://storage.example.com/evidence/img1.jpg",
        ...     uploaded_at=datetime.now()
        ... )
    """
    
    file_url: str = Field(
        ...,
        description="URL to the evidence file",
        json_schema_extra={"example": "https://storage.example.com/evidence/img1.jpg"},
    )
    exif_data: Optional[dict] = Field(
        default=None,
        description="Pre-extracted EXIF metadata if available",
        json_schema_extra={"example": {"datetime_original": "2024:01:15 14:30:00"}},
    )
    uploaded_at: datetime = Field(
        ...,
        description="Timestamp when evidence was uploaded",
        json_schema_extra={"example": "2024-01-20T10:30:00Z"},
    )


class CaseAnalysisRequest(BaseModel):
    """
    Request model for comprehensive dispute case analysis.
    
    Contains all information needed for DAO recommendation generation.
    
    Example:
        >>> request = CaseAnalysisRequest(
        ...     issue_id="abc123",
        ...     tenant_complaint="Broken heating...",
        ...     incident_date=datetime.now(),
        ...     tenant_evidence=[]
        ... )
    """
    
    issue_id: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Unique identifier for the dispute case",
        json_schema_extra={"example": "issue-abc123-def456"},
    )
    tenant_complaint: str = Field(
        ...,
        min_length=10,
        max_length=10000,
        description="Full text of tenant's complaint",
        json_schema_extra={
            "example": "The heating system has been broken for 3 weeks despite multiple repair requests. Temperature drops to 50F at night."
        },
    )
    landlord_response: Optional[str] = Field(
        default=None,
        max_length=10000,
        description="Landlord's response to the complaint (if provided)",
        json_schema_extra={
            "example": "We scheduled repairs twice but tenant was not home. A new appointment is pending."
        },
    )
    incident_date: datetime = Field(
        ...,
        description="Date when the issue was first reported",
        json_schema_extra={"example": "2024-01-10T00:00:00Z"},
    )
    tenant_evidence: list[EvidenceItem] = Field(
        default_factory=list,
        description="List of evidence items provided by tenant",
    )
    landlord_evidence: list[EvidenceItem] = Field(
        default_factory=list,
        description="List of evidence items provided by landlord",
    )
    property_history: Optional[PropertyHistory] = Field(
        default=None,
        description="Historical complaint data for the property",
    )
    
    @field_validator("tenant_complaint")
    @classmethod
    def validate_complaint(cls, v: str) -> str:
        """Strip whitespace and ensure non-empty content."""
        v = v.strip()
        if not v:
            raise ValueError("Tenant complaint cannot be empty")
        return v


class BatchClassificationRequest(BaseModel):
    """
    Request model for batch issue classification.
    
    Example:
        >>> request = BatchClassificationRequest(
        ...     issues=[
        ...         {"description": "Water leak...", "evidence_count": 2},
        ...         {"description": "Noise complaint...", "evidence_count": 0}
        ...     ]
        ... )
    """
    
    issues: list[IssueClassificationRequest] = Field(
        ...,
        min_length=1,
        max_length=50,
        description="List of issues to classify (max 50)",
    )
