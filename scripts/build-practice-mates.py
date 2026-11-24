"""Build exact mate distances up to six moves for KQK and KRK (python-chess)."""
from pathlib import Path
import base64
import json
import chess

OUT = Path(__file__).resolve().parents[1] / "dist/vendor/practice-mates.json"
# Canonicalise the attacking king into the lower-left triangle of the board.
def symmetry(square, flags):
    x, y = square % 8, square // 8
    if flags & 1: x = 7 - x
    if flags & 2: y = 7 - y
    if flags & 4: x, y = y, x
    return x + 8*y

anchors = [8*y+x for x in range(4) for y in range(x+1)]
maps = [[symmetry(s, f) for s in range(64)] for f in range(8)]
transform = [next(m for m in maps if m[k] in anchors) for k in range(64)]

def key(k, slider, enemy, defending):
    m = transform[k]
    return ((anchors.index(m[k])*64+m[slider])*64+m[enemy])*2 + defending

def build(piece):
    size = 10*64*64*2
    dist = bytearray([255])*size
    parents = [[] for _ in range(size)]
    remaining = [0]*size
    layer = []
    for king in anchors:
        for slider in range(64):
            for enemy in range(64):
                if len({king,slider,enemy})<3: continue
                board = chess.Board(None)
                for sq, typ, color in [(king,chess.KING,True),(slider,piece,True),(enemy,chess.KING,False)]:
                    board.set_piece_at(sq,chess.Piece(typ,color))
                for defending in [0,1]:
                    board.turn = not defending
                    if not board.is_valid(): continue
                    idx = key(king,slider,enemy,defending)
                    legal = list(board.legal_moves)
                    if not legal and board.is_check():
                        dist[idx]=0
                        layer.append(idx)
                    remaining[idx]=len(legal)
                    for move in legal:
                        a,b = move.from_square,move.to_square
                        if defending and b==slider: continue  # capture draws
                        dest = key(b if a==king else king,b if a==slider else slider,b if defending else enemy,1-defending)
                        parents[dest].append(idx)
    for depth in range(1,12):
        following=[]
        for child in layer:
            for parent in parents[child]:
                if dist[parent]!=255: continue
                remaining[parent]-=1
                if parent%2 and remaining[parent]: continue
                dist[parent]=depth
                following.append(parent)
        layer=following
    return dist

OUT.write_text(json.dumps(base64.b64encode(build(chess.QUEEN)+build(chess.ROOK)).decode("ascii"))+"\n",encoding="ascii")
