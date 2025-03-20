import uuid
from typing import Generic, List, Type, TypeVar

from fastapi import HTTPException
from pydantic import BaseModel
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

ModelType = TypeVar("ModelType")
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class BaseRepository(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType], db: Session):
        self.model = model
        self.db = db

    def get(self, id: str) -> ModelType | None:
        return self.db.query(self.model).filter(self.model.id == id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        return self.db.query(self.model).offset(skip).limit(limit).all()

    def create(self, obj_in: CreateSchemaType) -> ModelType:
        obj_data = obj_in.model_dump()
        db_obj = self.model(**obj_data)
        if hasattr(db_obj, "id") and not db_obj.id:
            db_obj.id = str(uuid.uuid4())
        self.db.add(db_obj)
        try:
            self.db.commit()
            self.db.refresh(db_obj)
        except SQLAlchemyError as e:
            self.db.rollback()
            raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")
        return db_obj

    def update(self, id: str, obj_in: UpdateSchemaType) -> ModelType | None:
        db_obj = self.get(id)
        if not db_obj:
            return None
        obj_data = obj_in.model_dump(exclude_unset=True)
        for key, value in obj_data.items():
            setattr(db_obj, key, value)
        self.db.add(db_obj)
        try:
            self.db.commit()
            self.db.refresh(db_obj)
        except SQLAlchemyError as e:
            self.db.rollback()
            raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")
        return db_obj

    def delete(self, id: str) -> ModelType | None:
        db_obj = self.get(id)
        if db_obj:
            self.db.delete(db_obj)
            try:
                self.db.commit()
            except SQLAlchemyError as e:
                self.db.rollback()
                raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")
        return db_obj
