import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from app import normalize_ingredient_names


class IngredientNormalizationTests(unittest.TestCase):
    def test_normalize_ingredient_names_accepts_object_payloads(self):
        raw = [
            {"name": " Tomato ", "quantity": "2"},
            {"name": "Onion", "quantity": "1"},
            " potato ",
        ]

        self.assertEqual(normalize_ingredient_names(raw), [
            "tomato",
            "onion",
            "potato",
        ])


if __name__ == "__main__":
    unittest.main()
