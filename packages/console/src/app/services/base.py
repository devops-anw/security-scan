from typing import Generic, List, TypeVar

from pydantic import BaseModel

from app.core.exceptions import DatabaseOperationException, ObjectNotFoundException
from app.repositories.base import BaseRepository
from app.utils import error_utils

ModelType = TypeVar("ModelType")
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class BaseService(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, repository: BaseRepository):
        self.repository = repository

    def get(self, id: str) -> ModelType:
        db_obj = self.repository.get(id)
        if db_obj is None:
            raise ObjectNotFoundException(
                message=f"Object with id {id} not found",
                error_code="OBJECT_NOT_FOUND",
                details={"id": id},
            )
        return db_obj

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        return self.repository.get_all(skip=skip, limit=limit)

    def create(self, obj_in: CreateSchemaType) -> ModelType:
        return self.repository.create(obj_in)

    def update(self, id: str, obj_in: UpdateSchemaType) -> ModelType:
        try:
            db_obj = self.repository.update(id, obj_in)
            if db_obj is None:
                raise ObjectNotFoundException(
                    message=f"Object with id {id} not found",
                    error_code="OBJECT_NOT_FOUND",
                    details={"id": id},
                )
            return db_obj
        except ObjectNotFoundException as e:
            raise e
        except Exception as e:
            # Log the exception here if you have a logging system set up
            # logger.error(f"Error updating object with id {id}: {str(e)}")

            # Wrap the exception in a custom exception or HTTPException
            raise DatabaseOperationException(
                message="An error occurred while updating the object",
                error_code="UPDATE_OPERATION_FAILED",
                details={
                    "id": id,
                    "error": error_utils.extract_error_details(e.detail),
                },
            ) from e

    def delete(self, id: str) -> ModelType:
        db_obj = self.repository.delete(id)
        if db_obj is None:
            raise ObjectNotFoundException(
                message=f"Object with id {id} not found",
                error_code="OBJECT_NOT_FOUND",
                details={"id": id},
            )
        return db_obj
