from typing import Literal, get_args

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

Level = Literal["A1", "A2", "B1", "B2", "C1"]
LEVELS: tuple[Level, ...] = get_args(Level)


class CamelModel(BaseModel):
    # The backend and the app use camelCase JSON.
    model_config = ConfigDict(
        alias_generator=to_camel,
        validate_by_name=True,
        serialize_by_alias=True,
    )


class Localized(CamelModel):
    en: str = Field(description="English")
    fr: str = Field(description="French")
    ar: str = Field(description="Modern Standard Arabic")


class LessonInfo(CamelModel):
    title: str = Field(min_length=1, max_length=200)
    level: Level
    unit_title: str = ""

    def describe(self) -> str:
        unit = f", unit \"{self.unit_title}\"" if self.unit_title else ""
        return f"Lesson \"{self.title}\"{unit}, CEFR level {self.level}."
