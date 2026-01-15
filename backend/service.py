import os
import requests
from dotenv import load_dotenv
import httpx # Импортируем httpx
import asyncio # Импортируем asyncio
import time # Добавляем time для задержек
import json # Добавляем json для кэширования
from datetime import datetime, timedelta

load_dotenv()

API_BASE_URL = "https://api.football-data.org/v4"
HEADERS = {"X-Auth-Token": os.getenv("API_KEY")}

# Кэш для данных
CACHE = {}
CACHE_DURATION = 300  # 5 минут кэширования

def get_cached_data(key):
    """Получить данные из кэша, если они еще актуальны"""
    if key in CACHE:
        data, timestamp = CACHE[key]
        if datetime.now() - timestamp < timedelta(seconds=CACHE_DURATION):
            print(f"📦 Используем кэшированные данные для {key}")
            return data
        else:
            print(f"⏰ Кэш для {key} устарел, обновляем...")
    return None

def set_cached_data(key, data):
    """Сохранить данные в кэш"""
    CACHE[key] = (data, datetime.now())
    print(f"💾 Данные для {key} сохранены в кэш")

def make_api_request_with_retry(url, params=None, max_retries=3):
    """Выполнить API запрос с повторными попытками и обработкой 429 ошибок"""
    for attempt in range(max_retries):
        try:
            print(f"🔄 Попытка {attempt + 1}/{max_retries} для {url}")
            response = requests.get(url, headers=HEADERS, params=params, timeout=15)
            
            if response.status_code == 429:
                wait_time = 15 * (attempt + 1)  # Увеличиваем время ожидания
                print(f"⚠️ Превышен лимит запросов. Ожидание {wait_time} секунд...")
                time.sleep(wait_time)
                continue
            elif response.status_code == 200:
                return response.json()
            else:
                response.raise_for_status()
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Ошибка запроса (попытка {attempt + 1}): {e}")
            if attempt < max_retries - 1:
                wait_time = 5 * (attempt + 1)
                print(f"⏳ Ожидание {wait_time} секунд перед повторной попыткой...")
                time.sleep(wait_time)
            else:
                raise e
    
    raise Exception(f"Не удалось получить данные после {max_retries} попыток")


# --- Существующие функции (без изменений) ---
def fetch_standings_normalized(competition_id="PL"):
    # Проверяем кэш
    cache_key = f"standings_{competition_id}"
    cached_data = get_cached_data(cache_key)
    if cached_data:
        return cached_data
    
    api_url = f"{API_BASE_URL}/competitions/{competition_id}/standings"
    data = make_api_request_with_retry(api_url)

    season = data["season"]["startDate"][:4]
    table_src = data["standings"][0]["table"]

    table = []
    for row in table_src:
        team = row["team"]
        table.append({
            "position": row["position"],
            "name": team["name"],
            "shortName": team["shortName"],
            "points": row["points"],
            "goalsFor": row["goalsFor"],
            "goalsAgainst": row["goalsAgainst"],
            "goalDifference": row["goalDifference"],
            "crest": team["crest"],
            "played": row["playedGames"],
            "won": row["won"],
            "drawn": row["draw"],
            "lost": row["lost"],
        })

    result = {
        "competition": data["competition"]["name"],
        "season": season,
        "table": table,
    }
    
    # Сохраняем в кэш
    set_cached_data(cache_key, result)
    
    return result


def fetch_top_scorers(competition_id="PL"):
    # ... (код без изменений)
    api_url = f"{API_BASE_URL}/competitions/{competition_id}/scorers?limit=20"
    r = requests.get(api_url, headers=HEADERS, timeout=10)
    r.raise_for_status()
    data = r.json()

    season = data["season"]["startDate"][:4]
    scorers_src = data["scorers"]

    scorers = []
    for row in scorers_src:
        player = row["player"]
        team = row["team"]
        scorers.append({
            "player": {
                "id": player["id"],
                "name": player["name"],
                "nationality": player.get("nationality"),
                "position": player.get("position"),
            },
            "team": {
                "id": team["id"],
                "name": team["name"],
                "shortName": team["shortName"],
                "crest": team["crest"],
            },
            "goals": row["goals"],
            "assists": row.get("assists"),
            "penalties": row.get("penalties"),
        })

    return {
        "competition": data["competition"]["name"],
        "season": season,
        "scorers": scorers,
    }


# --- Новая асинхронная функция для получения всех составов ---

async def fetch_team_squad(team_id: int, client: httpx.AsyncClient):
    """Асинхронно получает состав одной команды."""
    api_url = f"{API_BASE_URL}/teams/{team_id}"
    try:
        response = await client.get(api_url, headers=HEADERS, timeout=20)
        response.raise_for_status()
        data = response.json()
        
        squad = []
        for player in data.get("squad", []):
            squad.append({
                "id": player["id"],
                "name": player["name"],
                "position": player.get("position"),
                "dateOfBirth": player.get("dateOfBirth"),
                "nationality": player.get("nationality")
            })
            
        return {
            "id": data["id"],
            "name": data["name"],
            "shortName": data["shortName"],
            "crest": data["crest"],
            "squad": squad,
        }
    except httpx.HTTPStatusError as e:
        print(f"Error fetching team {team_id}: {e}")
        return None


async def fetch_squads_for_competition(competition_id="PL"):
    """Получает все команды лиги и асинхронно запрашивает состав каждой."""
    # 1. Получаем список команд (синхронно, так как это всего один запрос)
    standings_url = f"{API_BASE_URL}/competitions/{competition_id}/standings"
    r = requests.get(standings_url, headers=HEADERS, timeout=10)
    r.raise_for_status()
    standings_data = r.json()

    team_ids = [row["team"]["id"] for row in standings_data["standings"][0]["table"]]
    
    # 2. Асинхронно получаем составы всех команд
    async with httpx.AsyncClient() as client:
        tasks = [fetch_team_squad(team_id, client) for team_id in team_ids]
        teams_with_squads = await asyncio.gather(*tasks)

    # Фильтруем команды, для которых не удалось получить данные
    valid_teams = [team for team in teams_with_squads if team is not None]

    return {
        "competition": standings_data["competition"]["name"],
        "season": standings_data["season"]["startDate"][:4],
        "teams": valid_teams,
    }


async def fetch_team_players_async(team_id: int, team_name: str, client: httpx.AsyncClient, delay: float = 0):
    """Асинхронно получает игроков одной команды с задержкой."""
    try:
        # Добавляем задержку для избежания 429 ошибок
        if delay > 0:
            await asyncio.sleep(delay)
            
        team_url = f"{API_BASE_URL}/teams/{team_id}"
        print(f"🔄 Запрашиваем игроков команды {team_name}...")
        
        response = await client.get(team_url, headers=HEADERS, timeout=30)
        
        # Обрабатываем 429 ошибки
        if response.status_code == 429:
            print(f"⚠️ Превышен лимит запросов для {team_name}, ждем 60 секунд...")
            await asyncio.sleep(60)
            response = await client.get(team_url, headers=HEADERS, timeout=30)
        
        response.raise_for_status()
        team_info = response.json()
        
        squad = team_info.get("squad", [])
        print(f"✅ Найдено {len(squad)} игроков в команде {team_name}")
        
        players = []
        for player in squad:
            # Вычисляем возраст
            age = None
            if player.get("dateOfBirth"):
                birth_year = int(player["dateOfBirth"][:4])
                age = 2024 - birth_year
            
            players.append({
                "id": player["id"],
                "name": player["name"],
                "position": player.get("position", "Unknown"),
                "nationality": player.get("nationality", "Unknown"),
                "dateOfBirth": player.get("dateOfBirth", "1990-01-01"),
                "team": team_name,
                "teamId": team_id,
                "shirtNumber": player.get("shirtNumber"),
                "role": player.get("role", "PLAYER"),
                "age": age or 25
            })
        
        return players
        
    except Exception as e:
        print(f"❌ Ошибка при получении игроков команды {team_name}: {e}")
        return []

def get_players_by_competition(competition_id="PL"):
    """Получает всех игроков из команд лиги с реальными данными (оптимизированная версия)."""
    try:
        print(f"🔍 Начинаем парсинг реальных данных игроков для лиги {competition_id}")
        
        # Проверяем кэш
        cache_key = f"players_{competition_id}"
        cached_data = get_cached_data(cache_key)
        if cached_data:
            return cached_data
        
        # 1. Получаем команды лиги
        standings_url = f"{API_BASE_URL}/competitions/{competition_id}/standings"
        standings_data = make_api_request_with_retry(standings_url)
        
        teams = standings_data["standings"][0]["table"]
        print(f"🔍 Найдено команд в лиге: {len(teams)}")
        
        # 2. Асинхронно получаем игроков всех команд с задержками
        async def fetch_all_players():
            async with httpx.AsyncClient() as client:
                tasks = []
                for i, team_data in enumerate(teams):
                    team_id = team_data["team"]["id"]
                    team_name = team_data["team"]["name"]
                    # Добавляем задержку между запросами (1 секунда между каждым)
                    delay = i * 1.0
                    task = fetch_team_players_async(team_id, team_name, client, delay)
                    tasks.append(task)
                
                # Выполняем все запросы с задержками
                results = await asyncio.gather(*tasks, return_exceptions=True)
                
                all_players = []
                for result in results:
                    if isinstance(result, list):
                        all_players.extend(result)
                    elif isinstance(result, Exception):
                        print(f"❌ Ошибка при получении игроков: {result}")
                
                return all_players
        
        # Запускаем асинхронную функцию
        all_players = asyncio.run(fetch_all_players())
        
        print(f"🎯 Всего реальных игроков получено: {len(all_players)}")
        
        result = {
            "competition": standings_data["competition"]["name"],
            "season": standings_data["season"]["startDate"][:4],
            "players": all_players
        }
        
        # Сохраняем в кэш
        set_cached_data(cache_key, result)
        
        return result
        
    except Exception as e:
        print(f"❌ Ошибка при получении игроков: {e}")
        raise

def get_matches_by_competition(competition_id="PL", days_ahead=90):
    """Получает матчи лиги на ближайшие дни."""
    try:
        print(f"🔍 Начинаем парсинг матчей для лиги {competition_id}")
        
        # Получаем матчи на ближайшие дни (увеличиваем период до 90 дней)
        from datetime import datetime, timedelta
        today = datetime.now()
        date_to = (today + timedelta(days=days_ahead)).strftime('%Y-%m-%d')
        date_from = (today - timedelta(days=30)).strftime('%Y-%m-%d')  # Также включаем прошедшие матчи
        
        matches_url = f"{API_BASE_URL}/competitions/{competition_id}/matches"
        params = {
            'dateFrom': date_from,
            'dateTo': date_to
        }
        
        r = requests.get(matches_url, headers=HEADERS, params=params, timeout=10)
        r.raise_for_status()
        matches_data = r.json()
        
        matches = matches_data.get("matches", [])
        print(f"✅ Найдено {len(matches)} матчей для лиги {competition_id}")
        
        # Преобразуем данные матчей
        formatted_matches = []
        for match in matches:
            formatted_matches.append({
                "id": match["id"],
                "homeTeam": {
                    "id": match["homeTeam"]["id"],
                    "name": match["homeTeam"]["name"],
                    "shortName": match["homeTeam"]["shortName"],
                    "crest": match["homeTeam"]["crest"]
                },
                "awayTeam": {
                    "id": match["awayTeam"]["id"],
                    "name": match["awayTeam"]["name"],
                    "shortName": match["awayTeam"]["shortName"],
                    "crest": match["awayTeam"]["crest"]
                },
                "utcDate": match["utcDate"],
                "status": match["status"],
                "stage": match.get("stage", "REGULAR_SEASON"),
                "group": match.get("group", None),
                "lastUpdated": match.get("lastUpdated", None),
                "score": {
                    "fullTime": {
                        "home": match["score"]["fullTime"]["home"],
                        "away": match["score"]["fullTime"]["away"]
                    },
                    "halfTime": {
                        "home": match["score"]["halfTime"]["home"],
                        "away": match["score"]["halfTime"]["away"]
                    }
                } if match.get("score") else None,
                "competition": {
                    "id": match["competition"]["id"],
                    "name": match["competition"]["name"],
                    "code": match["competition"]["code"]
                }
            })
        
        return {
            "competition": matches_data["competition"]["name"],
            "season": "2024-25",
            "matches": formatted_matches
        }
        
    except Exception as e:
        print(f"❌ Ошибка при получении матчей: {e}")
        raise

def get_matches_by_round(competition_id="PL", matchday=None):
    """Получает матчи лиги по турам."""
    try:
        print(f"🔍 Начинаем парсинг матчей по турам для лиги {competition_id}")
        
        # Проверяем кэш
        cache_key = f"matches_rounds_{competition_id}"
        cached_data = get_cached_data(cache_key)
        if cached_data:
            return cached_data
        
        # Получаем матчи на ближайшие дни
        from datetime import datetime, timedelta
        today = datetime.now()
        date_to = (today + timedelta(days=90)).strftime('%Y-%m-%d')
        date_from = (today - timedelta(days=7)).strftime('%Y-%m-%d')
        
        matches_url = f"{API_BASE_URL}/competitions/{competition_id}/matches"
        params = {
            'dateFrom': date_from,
            'dateTo': date_to
        }
        
        if matchday:
            params['matchday'] = matchday
        
        # Используем новую функцию с повторными попытками
        matches_data = make_api_request_with_retry(matches_url, params)
        
        matches = matches_data.get("matches", [])
        print(f"✅ Найдено {len(matches)} матчей для лиги {competition_id}")
        
        # Группируем матчи по турам
        rounds = {}
        for match in matches:
            matchday = match.get("matchday", 1)
            if matchday not in rounds:
                rounds[matchday] = []
            
            rounds[matchday].append({
                "id": match["id"],
                "homeTeam": {
                    "id": match["homeTeam"]["id"],
                    "name": match["homeTeam"]["name"],
                    "shortName": match["homeTeam"]["shortName"],
                    "crest": match["homeTeam"]["crest"]
                },
                "awayTeam": {
                    "id": match["awayTeam"]["id"],
                    "name": match["awayTeam"]["name"],
                    "shortName": match["awayTeam"]["shortName"],
                    "crest": match["awayTeam"]["crest"]
                },
                "utcDate": match["utcDate"],
                "status": match["status"],
                "stage": match.get("stage", "REGULAR_SEASON"),
                "group": match.get("group", None),
                "lastUpdated": match.get("lastUpdated", None),
                "score": {
                    "fullTime": {
                        "home": match["score"]["fullTime"]["home"],
                        "away": match["score"]["fullTime"]["away"]
                    },
                    "halfTime": {
                        "home": match["score"]["halfTime"]["home"],
                        "away": match["score"]["halfTime"]["away"]
                    }
                } if match.get("score") else None,
                "competition": {
                    "id": match["competition"]["id"],
                    "name": match["competition"]["name"],
                    "code": match["competition"]["code"]
                }
            })
        
        # Сортируем туры по номеру
        sorted_rounds = dict(sorted(rounds.items()))
        
        result = {
            "competition": matches_data["competition"]["name"],
            "season": "2024-25",
            "rounds": sorted_rounds
        }
        
        # Сохраняем в кэш
        set_cached_data(cache_key, result)
        
        return result
        
    except Exception as e:
        print(f"❌ Ошибка при получении матчей по турам: {e}")
        raise