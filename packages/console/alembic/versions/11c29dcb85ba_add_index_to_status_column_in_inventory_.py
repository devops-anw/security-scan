"""Add index to status column in Inventory table

Revision ID: 11c29dcb85ba
Revises: 024e2677235c
Create Date: 2024-12-20 11:15:49.342568

"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "11c29dcb85ba"
down_revision: Union[str, None] = "024e2677235c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Add index to the `status` column of the `Inventory` table
    op.create_index("ix_inventory_status", "inventories", ["status"])


def downgrade():
    # Drop the index if the migration is rolled back
    op.drop_index("ix_inventory_status", "inventories")
