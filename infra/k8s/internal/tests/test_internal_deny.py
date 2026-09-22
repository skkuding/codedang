"""Regression checks for public internal-path protection. Run with unittest."""

from pathlib import Path
import re
import unittest


class InternalDenyTest(unittest.TestCase):
    def test_case_variants_and_path_boundary(self):
        manifest = (Path(__file__).resolve().parents[1] / "base/internal-deny-route.yaml").read_text()
        rules = re.findall(r"type: RegularExpression\s+value: '([^']+)'", manifest)
        self.assertEqual(len(rules), 1, "All listeners must share the case-insensitive matcher")
        blocked = [
            "/api/internal",
            "/api/internal/",
            "/api/internal/prisma",
            "/api/INTERNAL/prisma",
            "/API/InTeRnAl/PrIsMa",
            "/api/internal/test/nested",
        ]
        allowed = [
            "/api/internal-example",
            "/api/INTERNAL-example",
            "/api/internality/prisma",
            "/api/problems",
            "/graphql",
            "/",
        ]
        for rule in rules:
            matcher = re.compile(rule)
            for path in blocked:
                with self.subTest(rule=rule, path=path):
                    self.assertIsNotNone(matcher.search(path))
            for path in allowed:
                with self.subTest(rule=rule, path=path):
                    self.assertIsNone(matcher.search(path))


if __name__ == "__main__":
    unittest.main()
