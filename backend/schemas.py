from pydantic import BaseModel
from typing import List, Optional
from datetime import date

# --- Существующие модели ---
class Team(BaseModel):
    position: int
    name: str
    shortName: str
    points: int
    goalsFor: int
    goalsAgainst: int
    goalDifference: int
    crest: str
    played: int
    won: int
    drawn: int
    lost: int

class StandingsResponse(BaseModel):
    competition: str
    season: str
    table: List[Team]

# --- Новые модели для матчей ---
class TeamInfo(BaseModel):
    id: int
    name: str
    shortName: str
    crest: str

class Score(BaseModel):
    home: Optional[int] = None
    away: Optional[int] = None

class MatchScore(BaseModel):
    fullTime: Optional[Score] = None
    halfTime: Optional[Score] = None

class CompetitionInfo(BaseModel):
    id: int
    name: str
    code: str

class Match(BaseModel):
    id: int
    homeTeam: TeamInfo
    awayTeam: TeamInfo
    utcDate: str
    status: str
    stage: str
    group: Optional[str] = None
    lastUpdated: Optional[str] = None
    score: Optional[MatchScore] = None
    competition: CompetitionInfo

class MatchesResponse(BaseModel):
    competition: str
    season: str
    matches: List[Match]

class PlayerInfo(BaseModel):
    id: int
    name: str
    nationality: Optional[str] = None
    position: Optional[str] = None

class TeamInfo(BaseModel):
    id: int
    name: str
    shortName: str
    crest: str

class Scorer(BaseModel):
    player: PlayerInfo
    team: TeamInfo
    goals: int
    assists: Optional[int] = None
    penalties: Optional[int] = None

class TopScorersResponse(BaseModel):
    competition: str
    season: str
    scorers: List[Scorer]

# --- Новые модели для составов команд ---
class Player(BaseModel):
    id: int
    name: str
    position: Optional[str]
    dateOfBirth: Optional[date]
    nationality: Optional[str]

class TeamWithSquad(BaseModel):
    id: int
    name: str
    shortName: str
    crest: str
    squad: List[Player]

class CompetitionSquadsResponse(BaseModel):
    competition: str
    season: str
    teams: List[TeamWithSquad]