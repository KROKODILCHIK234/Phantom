from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
# Добавляем новые модели ответа
from schemas import StandingsResponse, MatchesResponse
# Добавляем новую сервисную функцию
from service import fetch_standings_normalized, get_players_by_competition, get_matches_by_competition, get_matches_by_round, get_cached_data, set_cached_data, fetch_team_players_async
import asyncio
import httpx
from service import API_BASE_URL, HEADERS

app = FastAPI(title="Football Data API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

# --- Эндпоинты для таблиц лиг ---

@app.get("/standings", response_model=StandingsResponse)
def get_premier_league_standings():
    """Возвращает таблицу Premier League."""
    try:
        return fetch_standings_normalized("PL")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {e}")

@app.get("/standings/la-liga", response_model=StandingsResponse)
def get_la_liga_standings():
    """Возвращает таблицу La Liga."""
    try:
        return fetch_standings_normalized("PD")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {e}")

@app.get("/standings/bundesliga", response_model=StandingsResponse)
def get_bundesliga_standings():
    """Возвращает таблицу Bundesliga."""
    try:
        return fetch_standings_normalized("BL1")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {e}")

@app.get("/standings/serie-a", response_model=StandingsResponse)
def get_serie_a_standings():
    """Возвращает таблицу Serie A."""
    try:
        return fetch_standings_normalized("SA")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {e}")

@app.get("/standings/ligue-1", response_model=StandingsResponse)
def get_ligue_1_standings():
    """Возвращает таблицу Ligue 1."""
    try:
        return fetch_standings_normalized("FL1")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {e}")


# --- Эндпоинты для получения реальных данных игроков ---

@app.get("/players/premier-league")
def get_premier_league_players():
    """Возвращает всех реальных игроков Premier League."""
    try:
        return get_players_by_competition("PL")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {e}")

@app.get("/players/la-liga")
def get_la_liga_players():
    """Возвращает всех реальных игроков La Liga."""
    try:
        return get_players_by_competition("PD")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {e}")

@app.get("/players/bundesliga")
def get_bundesliga_players():
    """Возвращает всех реальных игроков Bundesliga."""
    try:
        return get_players_by_competition("BL1")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {e}")

@app.get("/players/serie-a")
def get_serie_a_players():
    """Возвращает всех реальных игроков Serie A."""
    try:
        return get_players_by_competition("SA")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {e}")

@app.get("/players/ligue-1")
def get_ligue_1_players():
    """Возвращает всех реальных игроков Ligue 1."""
    try:
        return get_players_by_competition("FL1")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {e}")

@app.get("/players/all")
def get_all_players():
    """Возвращает всех игроков из всех топ-5 лиг (быстрая версия)."""
    try:
        # Проверяем кэш для всех игроков
        cache_key = "all_players"
        cached_data = get_cached_data(cache_key)
        if cached_data:
            return cached_data
        
        # Используем только данные из кэша отдельных лиг для быстрой загрузки
        all_players = []
        competitions = [
            ("PL", "Premier League"),
            ("PD", "La Liga"), 
            ("BL1", "Bundesliga"),
            ("SA", "Serie A"),
            ("FL1", "Ligue 1")
        ]
        
        for comp_id, comp_name in competitions:
            try:
                # Проверяем кэш для каждой лиги отдельно
                league_cache_key = f"players_{comp_id}"
                league_cached_data = get_cached_data(league_cache_key)
                if league_cached_data and league_cached_data.get("players"):
                    all_players.extend(league_cached_data["players"])
                    print(f"✅ Используем кэшированные данные {comp_name}: {len(league_cached_data['players'])} игроков")
                else:
                    print(f"⚠️ Нет кэшированных данных для {comp_name}")
            except Exception as e:
                print(f"❌ Ошибка при получении данных {comp_name}: {e}")
                continue
        
        print(f"🎯 Всего игроков из всех лиг: {len(all_players)}")
        
        result = {
            "competition": "All Top-5 Leagues",
            "season": "2024-25",
            "players": all_players
        }
        
        # Сохраняем в кэш
        set_cached_data(cache_key, result)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {e}")

@app.get("/players/quick")
def get_players_quick():
    """Быстрая загрузка игроков - возвращает только кэшированные данные."""
    try:
        # Собираем игроков из всех кэшированных лиг
        all_players = []
        competitions = [
            ("PL", "Premier League"),
            ("PD", "La Liga"), 
            ("BL1", "Bundesliga"),
            ("SA", "Serie A"),
            ("FL1", "Ligue 1")
        ]
        
        for comp_id, comp_name in competitions:
            try:
                league_cache_key = f"players_{comp_id}"
                league_cached_data = get_cached_data(league_cache_key)
                if league_cached_data and league_cached_data.get("players"):
                    all_players.extend(league_cached_data["players"])
                    print(f"✅ {comp_name}: {len(league_cached_data['players'])} игроков")
            except Exception as e:
                print(f"❌ Ошибка для {comp_name}: {e}")
                continue
        
        print(f"🚀 Быстрая загрузка: {len(all_players)} игроков")
        
        return {
            "competition": "All Top-5 Leagues",
            "season": "2024-25",
            "players": all_players,
            "source": "cached"
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {e}")

@app.get("/players/league/{league_id}")
def get_players_by_league(league_id: str):
    """Возвращает игроков конкретной лиги."""
    try:
        # Проверяем кэш
        cache_key = f"players_league_{league_id}"
        cached_data = get_cached_data(cache_key)
        if cached_data:
            return cached_data
        
        # Маппинг названий лиг на коды
        league_mapping = {
            "premier-league": ("PL", "Premier League"),
            "la-liga": ("PD", "La Liga"),
            "bundesliga": ("BL1", "Bundesliga"),
            "serie-a": ("SA", "Serie A"),
            "ligue-1": ("FL1", "Ligue 1")
        }
        
        if league_id not in league_mapping:
            raise HTTPException(status_code=404, detail="League not found")
        
        comp_id, comp_name = league_mapping[league_id]
        
        # Получаем игроков лиги
        players_data = get_players_by_competition(comp_id)
        
        result = {
            "competition": comp_name,
            "season": "2024-25",
            "players": players_data["players"]
        }
        
        # Сохраняем в кэш
        set_cached_data(cache_key, result)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {e}")

async def fetch_competition_players_async(comp_id: str, comp_name: str, client: httpx.AsyncClient):
    """Асинхронно получает игроков одной лиги."""
    try:
        print(f"🔄 Загружаем игроков {comp_name}...")
        
        # Получаем команды лиги
        standings_url = f"{API_BASE_URL}/competitions/{comp_id}/standings"
        response = await client.get(standings_url, headers=HEADERS, timeout=20)
        response.raise_for_status()
        standings_data = response.json()
        
        teams = standings_data["standings"][0]["table"]
        
        # Получаем игроков всех команд параллельно
        tasks = []
        for team_data in teams:
            team_id = team_data["team"]["id"]
            team_name = team_data["team"]["name"]
            task = fetch_team_players_async(team_id, team_name, client)
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        players = []
        for result in results:
            if isinstance(result, list):
                players.extend(result)
            elif isinstance(result, Exception):
                print(f"❌ Ошибка при получении игроков команды: {result}")
        
        print(f"✅ {comp_name}: {len(players)} игроков")
        return players
        
    except Exception as e:
        print(f"❌ Ошибка при получении игроков {comp_name}: {e}")
        return []


# --- Эндпоинты для матчей ---

@app.get("/matches/premier-league", response_model=MatchesResponse)
def get_premier_league_matches():
    """Возвращает матчи Premier League."""
    try:
        return get_matches_by_competition("PL")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {e}")

@app.get("/matches/la-liga", response_model=MatchesResponse)
def get_la_liga_matches():
    """Возвращает матчи La Liga."""
    try:
        return get_matches_by_competition("PD")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {e}")

@app.get("/matches/bundesliga", response_model=MatchesResponse)
def get_bundesliga_matches():
    """Возвращает матчи Bundesliga."""
    try:
        return get_matches_by_competition("BL1")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {e}")

@app.get("/matches/serie-a", response_model=MatchesResponse)
def get_serie_a_matches():
    """Возвращает матчи Serie A."""
    try:
        return get_matches_by_competition("SA")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {e}")

@app.get("/matches/ligue-1", response_model=MatchesResponse)
def get_ligue_1_matches():
    """Возвращает матчи Ligue 1."""
    try:
        return get_matches_by_competition("FL1")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {e}")

@app.get("/matches/all")
def get_all_matches():
    """Возвращает матчи всех топ-5 лиг."""
    try:
        all_matches = []
        competitions = [
            ("PL", "Premier League"),
            ("PD", "La Liga"), 
            ("BL1", "Bundesliga"),
            ("SA", "Serie A"),
            ("FL1", "Ligue 1")
        ]
        
        for comp_id, comp_name in competitions:
            try:
                matches_data = get_matches_by_competition(comp_id)
                all_matches.extend(matches_data["matches"])
            except Exception as e:
                print(f"❌ Ошибка при получении матчей {comp_name}: {e}")
                continue
        
        return {
            "competition": "All Top-5 Leagues",
            "season": "2024-25",
            "matches": all_matches
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {e}")


# --- Эндпоинты для матчей по турам ---

@app.get("/matches/rounds/premier-league")
def get_premier_league_rounds():
    """Возвращает матчи Premier League по турам."""
    try:
        return get_matches_by_round("PL")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {e}")

@app.get("/matches/rounds/la-liga")
def get_la_liga_rounds():
    """Возвращает матчи La Liga по турам."""
    try:
        return get_matches_by_round("PD")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {e}")

@app.get("/matches/rounds/bundesliga")
def get_bundesliga_rounds():
    """Возвращает матчи Bundesliga по турам."""
    try:
        return get_matches_by_round("BL1")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {e}")

@app.get("/matches/rounds/serie-a")
def get_serie_a_rounds():
    """Возвращает матчи Serie A по турам."""
    try:
        return get_matches_by_round("SA")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {e}")

@app.get("/matches/rounds/ligue-1")
def get_ligue_1_rounds():
    """Возвращает матчи Ligue 1 по турам."""
    try:
        return get_matches_by_round("FL1")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {e}")

@app.get("/matches/rounds/all")
def get_all_rounds():
    """Возвращает матчи всех топ-5 лиг по турам."""
    try:
        all_rounds = {}
        competitions = [
            ("PL", "Premier League"),
            ("PD", "La Liga"), 
            ("BL1", "Bundesliga"),
            ("SA", "Serie A"),
            ("FL1", "Ligue 1")
        ]
        
        for comp_id, comp_name in competitions:
            try:
                rounds_data = get_matches_by_round(comp_id)
                all_rounds[comp_name] = rounds_data["rounds"]
            except Exception as e:
                print(f"❌ Ошибка при получении туров {comp_name}: {e}")
                continue
        
        return {
            "competition": "All Top-5 Leagues",
            "season": "2024-25",
            "rounds": all_rounds
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {e}")


# --- Health Check (без изменений) ---
@app.get("/health")
def health_check():
    """Проверка состояния API."""
    return {"status": "healthy", "message": "Football API is running"}