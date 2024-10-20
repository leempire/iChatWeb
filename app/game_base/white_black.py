import random


class Deck:

    def __init__(self, deck=None):
        if deck is None:
            self.deck = [[0] * 8 for _ in range(8)]
            self.deck[3][3] = self.deck[4][4] = 1
            self.deck[3][4] = self.deck[4][3] = 2
        elif isinstance(deck, Deck):
            self.deck = [[i for i in line] for line in deck.deck]
        else:
            self.deck = [[i for i in line] for line in deck]

    def __str__(self):
        txt = '┼'
        for _ in range(8):
            txt += '---┼'
        txt += '\n'
        t = [' ', 'x', 'o']
        for line in self.deck:
            txt += '|'
            for i in line:
                txt += ' {} |'.format(t[i])
            txt += '\n'
        txt += '┼'
        for _ in range(8):
            txt += '---┼'
        txt += '\n'
        return txt

    def drop(self, row, col, kind):
        change = self.check_change(row, col, kind)
        if not change:
            raise ValueError
        else:
            for r, c in change:
                self.deck[r][c] = kind
            self.deck[row][col] = kind
        return change

    def check_change(self, row, col, kind):
        """在(row, col)落下kind时，翻转的棋子"""
        if self.deck[row][col] != 0:
            return []
        all_step = []
        for item in [(-1, 0), (-1, -1), (0, -1), (1, -1), (1, 0), (1, 1), (0, 1), (-1, 1)]:
            _row, _col = row, col
            step = []
            while True:
                _row += item[0]
                _col += item[1]
                if 0 <= _row < 8 and 0 <= _col < 8:
                    if self.deck[_row][_col] == kind:  # 碰到同色，终止
                        all_step.extend(step)
                        break
                    elif self.deck[_row][_col] == 3 - kind:  # 异色翻转
                        step.append([_row, _col])
                    elif self.deck[_row][_col] == 0:  # 空白终止
                        break
                else:
                    break
        return all_step

    def check_valid(self, kind):
        valid = []
        for row in range(8):
            for col in range(8):
                if self.deck[row][col] == 0 and self.check_change(row, col, kind):
                    valid.append([row, col])
        return valid


class WhiteBlack:
    def __init__(self):
        self.now = 1
        self.deck = Deck()
        self.last_change = []
        self.last_drop = None
        self.ai = 2  # 0关闭, 1黑棋, 2白棋

    def reset(self):
        self.now = 1
        self.deck = Deck()
        self.last_change = []
        self.last_drop = None

    def drop(self, x, y):
        self.last_change = self.deck.drop(x, y, self.now)
        self.last_drop = [x, y]
        if self.deck.check_valid(3 - self.now):
            self.now = 3 - self.now
        self.ai_update()

    def ai_update(self):
        if self.ai == self.now:
            self.drop(*V2(self.deck, self.now).act())

    def get_state(self):
        state = dict()
        state['deck'] = self.deck.deck
        state['now'] = self.now
        state['blackWhiteNum'] = self.check_black_white_num()
        state['blackAble'] = self.get_black_able()
        state['whiteAble'] = self.get_white_able()
        state['lastChange'] = self.last_change
        state['lastDrop'] = self.last_drop
        state['ai'] = self.ai
        return state

    def check_black_white_num(self):
        count = [0, 0]
        for line in self.deck.deck:
            for item in line:
                if item == 1:
                    count[0] += 1
                elif item == 2:
                    count[1] += 1
        return count

    def get_black_able(self):
        return self.deck.check_valid(1)

    def get_white_able(self):
        return self.deck.check_valid(2)


class Ai:
    def __init__(self, deck, kind):
        """输入：当前棋盘、AI执子kind（1黑2白）"""
        self.deck = Deck(deck)
        self.kind = kind

    def act(self) -> [int, int]:
        """决策，输出(row, col)"""
        ...


class V1(Ai):
    """行动点优先决策：maximize 下完之后自己的行动点 - 对方的行动点"""

    def act(self) -> [int, int]:
        valid_point = self.deck.check_valid(self.kind)
        if not valid_point:
            raise IndexError
        scores = []
        for row, col in valid_point:
            # 模拟在(row, col)下
            deck_copy = Deck(self.deck)
            deck_copy.drop(row, col, self.kind)
            score = len(deck_copy.check_valid(self.kind))  # 下一步能下的位置
            score -= len(deck_copy.check_valid(3 - self.kind))  # 下一步对方能下的位置
            scores.append(score)
        best_index = scores.index(max(scores))
        return valid_point[best_index]


class V2(Ai):
    """位置优先级算法"""

    def act(self) -> [int, int]:
        priority = [[1, 9, 2, 4, 4, 2, 9, 1],
                    [9, 10, 8, 7, 7, 8, 10, 9],
                    [2, 8, 3, 5, 5, 3, 8, 2],
                    [4, 7, 5, 6, 6, 5, 7, 4],
                    [4, 7, 5, 6, 6, 5, 7, 4],
                    [2, 8, 3, 5, 5, 3, 8, 2],
                    [9, 10, 8, 7, 7, 8, 10, 9],
                    [1, 9, 2, 4, 4, 2, 9, 1], ]
        valid_point = self.deck.check_valid(self.kind)
        if not valid_point:
            raise IndexError
        best_steps = []
        best_score = -100
        for row, col in valid_point:
            score = -priority[row][col]
            if score == best_score:
                best_steps.append([row, col])
            elif score > best_score:
                best_steps = [[row, col]]
                best_score = score
        return random.choice(best_steps)


whiteBlack = WhiteBlack()
if __name__ == '__main__':
    print(V2(Deck(), 1).act())
