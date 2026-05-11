# { "Depends": "py-genlayer:test" }
from genlayer import *

class GenTuring(gl.Contract):
    total_games: int
    correct_guesses: int

    def __init__(self):
        self.total_games = 0
        self.correct_guesses = 0

    @gl.public.view
    def get_stats(self) -> dict:
        return {
            "total_games": self.total_games,
            "correct_guesses": self.correct_guesses
        }

    @gl.public.write
    def judge_response(self, message: str, player_guess: str) -> str:
        verdict = gl.eq_principle_prompt_comparative(
            f"Is this message written by a human or an AI?\n"
            f"Message: '{message}'\n"
            f"Analyze natural language patterns, typos, "
            f"emotional tone, casual phrasing.",
            "human",
            principle="The response that feels more authentically "
                      "human in rhythm and imperfection"
        )
        is_human = "human" in verdict.lower()
        actual = "human" if is_human else "ai"
        correct = player_guess.lower() == actual
        self.total_games += 1
        if correct:
            self.correct_guesses += 1
        return (
            f'{{"verdict":"{actual}",'
            f'"correct":{str(correct).lower()},'
            f'"reasoning":"{verdict[:100]}"}}'
        )
