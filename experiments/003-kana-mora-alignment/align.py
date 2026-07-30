#!/usr/bin/env python3
import json

SMALL = set('ゃゅょぁぃぅぇぉゎ')

def morae(text: str):
    text = ''.join(ch for ch in text if ch not in ' 、。！？!?')
    out = []
    for ch in text:
        if ch in SMALL and out:
            out[-1] += ch
        else:
            out.append(ch)
    return out

def align(expected, observed):
    a, b = morae(expected), morae(observed)
    n, m = len(a), len(b)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    op = [[None] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1): dp[i][0], op[i][0] = i, 'delete'
    for j in range(1, m + 1): dp[0][j], op[0][j] = j, 'insert'
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            candidates = [
                (dp[i-1][j-1] + (a[i-1] != b[j-1]), 'equal' if a[i-1] == b[j-1] else 'replace'),
                (dp[i-1][j] + 1, 'delete'),
                (dp[i][j-1] + 1, 'insert'),
            ]
            dp[i][j], op[i][j] = min(candidates, key=lambda x: x[0])
    i, j, edits = n, m, []
    while i or j:
        action = op[i][j]
        if action in ('equal', 'replace'):
            edits.append({'op': action, 'expected': a[i-1], 'observed': b[j-1], 'expectedIndex': i-1}); i -= 1; j -= 1
        elif action == 'delete':
            edits.append({'op': 'delete', 'expected': a[i-1], 'observed': None, 'expectedIndex': i-1}); i -= 1
        else:
            edits.append({'op': 'insert', 'expected': None, 'observed': b[j-1], 'expectedIndex': i}); j -= 1
    edits.reverse()
    return {'expectedMorae': a, 'observedMorae': b, 'distance': dp[n][m], 'edits': edits}

CASES = {
    'exact': ('きょうはてんきがいいですね', 'きょうはてんきがいいですね'),
    'missing_long_vowel': ('きょうはてんきがいいですね', 'きょはてんきがいいですね'),
    'missing_small_tsu': ('きってをかいます', 'きてをかいます'),
    'substitution': ('すしをたべます', 'すしをたべません'),
    'insertion': ('ねこがいます', 'ねこはがいます'),
}

print(json.dumps({'experiment': '003-kana-mora-alignment', 'results': {name: align(*pair) for name, pair in CASES.items()}}, ensure_ascii=False, indent=2))
