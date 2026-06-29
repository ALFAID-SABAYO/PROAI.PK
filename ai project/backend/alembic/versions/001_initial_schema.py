"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-06-16

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("role", sa.Enum("admin", "investor", "agent", name="userrole"), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)

    op.create_table(
        "properties",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("external_id", sa.Integer(), nullable=True),
        sa.Column("property_type", sa.String(length=100), nullable=False),
        sa.Column("price", sa.Float(), nullable=False),
        sa.Column("location", sa.String(length=255), nullable=False),
        sa.Column("city", sa.String(length=100), nullable=False),
        sa.Column("province_name", sa.String(length=100), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("baths", sa.Integer(), nullable=True),
        sa.Column("bedrooms", sa.Integer(), nullable=True),
        sa.Column("area_type", sa.String(length=50), nullable=True),
        sa.Column("area_size", sa.Float(), nullable=True),
        sa.Column("area_category", sa.String(length=50), nullable=True),
        sa.Column("purpose", sa.String(length=50), nullable=True),
        sa.Column("page_url", sa.Text(), nullable=True),
        sa.Column("agency", sa.String(length=255), nullable=True),
        sa.Column("agent_name", sa.String(length=255), nullable=True),
        sa.Column("date_added", sa.String(length=50), nullable=True),
        sa.Column("agent_id", sa.Integer(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["agent_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_properties_agent_id"), "properties", ["agent_id"], unique=False)
    op.create_index(op.f("ix_properties_city"), "properties", ["city"], unique=False)
    op.create_index(op.f("ix_properties_external_id"), "properties", ["external_id"], unique=True)
    op.create_index(op.f("ix_properties_id"), "properties", ["id"], unique=False)
    op.create_index(op.f("ix_properties_location"), "properties", ["location"], unique=False)
    op.create_index(op.f("ix_properties_price"), "properties", ["price"], unique=False)
    op.create_index(op.f("ix_properties_property_type"), "properties", ["property_type"], unique=False)

    op.create_table(
        "favorites",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("property_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "property_id", name="uq_user_property"),
    )
    op.create_index(op.f("ix_favorites_id"), "favorites", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_favorites_id"), table_name="favorites")
    op.drop_table("favorites")
    op.drop_index(op.f("ix_properties_property_type"), table_name="properties")
    op.drop_index(op.f("ix_properties_price"), table_name="properties")
    op.drop_index(op.f("ix_properties_location"), table_name="properties")
    op.drop_index(op.f("ix_properties_id"), table_name="properties")
    op.drop_index(op.f("ix_properties_external_id"), table_name="properties")
    op.drop_index(op.f("ix_properties_city"), table_name="properties")
    op.drop_index(op.f("ix_properties_agent_id"), table_name="properties")
    op.drop_table("properties")
    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS userrole")
