from typing import List, Optional

from pydantic import BaseModel


class TokenData(BaseModel):
    username: Optional[str] = None
    org_id: str
    roles: List[str] = []


class OrgData(BaseModel):
    org_id: str
