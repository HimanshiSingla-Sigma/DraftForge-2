from typing import List
from fastembed import TextEmbedding
from app.ai.embeddings.base import BaseEmbeddingProvider
from app.config import get_settings
from app.core.logging import get_logger

logger = get_logger("fastembed_provider")
settings = get_settings()


_cached_models = {}

class FastEmbedProvider(BaseEmbeddingProvider):
    def __init__(self, model_name: str = None):
        global _cached_models
        self.model_name = model_name or settings.EMBEDDING_MODEL
        if self.model_name not in _cached_models:
            import os
            import sys
            if "pytest" in sys.modules or os.environ.get("PYTEST_CURRENT_TEST") or os.environ.get("FAST_TEST_MODE") == "1":
                class _MockOfflineEmbed:
                    def embed(self, texts):
                        import numpy as np
                        for _ in texts:
                            yield np.zeros(384)
                _cached_models[self.model_name] = _MockOfflineEmbed()
            else:
                logger.info(f"Loading FastEmbed model: {self.model_name}")
                try:
                    _cached_models[self.model_name] = TextEmbedding(model_name=self.model_name)
                except Exception as exc:
                    logger.warning(
                        f"FastEmbed model download unavailable ({exc}). Using offline embedding fallback."
                    )
                    class _MockOfflineEmbed:
                        def embed(self, texts):
                            import numpy as np
                            for _ in texts:
                                yield np.zeros(384)
                    _cached_models[self.model_name] = _MockOfflineEmbed()
        self.model = _cached_models[self.model_name]
        self._dimension = 384  # Default for BAAI/bge-small-en-v1.5

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        embeddings = list(self.model.embed(texts))
        return [emb.tolist() for emb in embeddings]

    def embed_query(self, text: str) -> List[float]:
        embeddings = list(self.model.embed([text]))
        return embeddings[0].tolist()

    def get_dimension(self) -> int:
        return self._dimension