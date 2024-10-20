class WellChess:
    def __init__(self):
        self.desk = [-1] * 9
        self.state = '1'

    def init(self):
        self.desk = [-1] * 9
        self.state = '1'

    def drop(self, point=None):
        if point is not None:
            if self.state in '01':
                if self.desk[point] == -1:
                    now = self.desk.count(-1) % 2
                    self.desk[point] = now
            else:
                self.init()
        self.state = self.check_win()
        return {'state': self.state, 'desk': self.desk}

    def check_win(self):
        for y in range(3):
            if self.desk[3 * y] == self.desk[3 * y + 1] == self.desk[3 * y + 2] != -1:
                return 'win'.format(self.desk[3 * y])
        for x in range(3):
            if self.desk[x] == self.desk[x + 3] == self.desk[x + 6] != -1:
                return 'win'.format(self.desk[x])
        for i in range(2):
            if self.desk[2 * i] == self.desk[4] == self.desk[8 - 2 * i] != -1:
                return 'win'.format(self.desk[4])
        if -1 not in self.desk:
            return 'draw'
        return str(self.desk.count(-1) % 2)


well_chess_manager = WellChess()
