from sqlalchemy import BigInteger, Column, DateTime, Integer, text
from sqlalchemy.dialects.postgresql import JSONB

from src.models.base import Base
from src.models.model_utils import RepresentableMixin


class AlbumPriceHistory(Base, RepresentableMixin):
    __tablename__ = "album_price_history"

    playlist_id = Column(Integer, nullable=False, primary_key=True)
    splits = Column(JSONB(), nullable=False)
    """
    Dict[str, int]: The splits of the playlist.
            The key is the destination address and the value is allocated split in usdc wei.
    """

    total_price_cents = Column(BigInteger, nullable=False)
    blocknumber = Column(BigInteger, nullable=False)
    block_timestamp = Column(DateTime, nullable=False, primary_key=True)
    created_at = Column(
        DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP")
    )
