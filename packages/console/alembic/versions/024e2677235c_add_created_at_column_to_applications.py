"""add created_at column to applications

Revision ID: 024e2677235c
Revises: bf71a03ba27e
Create Date: 2024-12-18 15:55:39.999423

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "024e2677235c"
down_revision: Union[str, None] = "bf71a03ba27e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add the created_at column with a default value of CURRENT_TIMESTAMP
    op.add_column(
        "applications",
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),  # PostgreSQL default
            nullable=False,
        ),
    )


def downgrade() -> None:
    # Remove the created_at column during downgrade
    op.drop_column("applications", "created_at")
