import json
import math


class MyJsonEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, BigNumber):
            data = {'__class__': 'BigNumber', 'value': obj.n}
            if obj.sign == -1:
                data['sign'] = -1
            return data
        else:
            return json.JSONEncoder.default(self, obj)


class MyJsonDecoder(json.JSONDecoder):

    def __init__(self, *args, **kwargs):
        super().__init__(object_hook=self.object_hook, *args, **kwargs)

    def object_hook(self, o):
        if o.get('__class__') == "BigNumber":
            n = BigNumber(o.get('value'))
            if 'sign' in o:
                n.sign = o['sign']
            return n
        return o


class BigNumber:
    p = 32
    n = ['0', 0]
    sign = 1

    def __init__(self, n, delta_p=0):
        if type(n) == list:
            self.n = n
            return
        if isinstance(n, BigNumber):
            self.n = n.n
            self.sign = n.sign
            return
        elif type(n) == int or type(n) == float:
            n = str(n)
        if type(n) == str:

            if n[0] == '-':
                n = n[1:]
                self.sign = -1
            else:
                self.sign = 1
            power = BigNumber.p - 1 + delta_p
            if 'e' in n:
                power += int(n[n.find('e') + 1:])
                n = n[:n.find('e')]
            if '.' in n:
                power -= len(n[n.find('.') + 1:])
                n = n.replace('.', '')
            while len(n) > 1 and n[0] == '0':
                n = n[1:]
            while len(n) > 1 and n[-1] == '0':
                n = n[:-1]
                power += 1
            power += len(n) - BigNumber.p
            n = n[:BigNumber.p]
            if n == '0':
                power = 0
                self.sign = 1
            self.n = [n, power]

    def floor(self):
        n, p = self.n
        if p < 0:
            return BigNumber(0)
        n = n[:p + 1]
        n += '0' * (p + 1 - len(n))
        return BigNumber(n)

    def __add__(self, other):
        if type(other) == int or type(other) == float:
            return self + BigNumber(other)
        n1, p1 = self.n
        n2, p2 = other.n
        if p1 < p2:  # 保证 self > other
            return other + self
        if p1 - p2 > self.p:
            return self
        dd = p2 - BigNumber.p + 1
        n1 += '0' * (BigNumber.p - len(n1)) + '0' * (p1 - p2)
        n2 += '0' * (BigNumber.p - len(n2))
        n3 = self.sign * int(n1) + other.sign * int(n2)
        n3 = BigNumber(n3, dd)
        return n3

    def __radd__(self, other):
        return self + other

    def __iadd__(self, other):
        n1 = self + other
        self.n = n1.n
        return self

    def __sub__(self, other):
        if type(other) == int or type(other) == float:
            return self - BigNumber(other)
        n1, p1 = self.n
        n2, p2 = other.n
        if p1 < p2:
            n3 = other - self
            n3.sign = - n3.sign
            return n3
        if p1 - p2 > self.p:
            return self
        dd = p2 - BigNumber.p + 1
        n1 += '0' * (BigNumber.p - len(n1)) + '0' * (p1 - p2)
        n2 += '0' * (BigNumber.p - len(n2))
        n3 = self.sign * int(n1) - other.sign * int(n2)
        n3 = BigNumber(n3, dd)
        return n3

    def __isub__(self, other):
        n1 = self - other
        self.n = n1.n
        return self

    def __mul__(self, other):
        if type(other) == int or type(other) == float:
            return self * BigNumber(other)
        n1, p1 = self.n
        n2, p2 = other.n
        dd = len(n1) + len(n2) - 2 - p1 - p2
        n3 = BigNumber(self.sign * other.sign * int(n1) * int(n2), -dd)
        return n3

    def __rmul__(self, other):
        return self * other

    def __imul__(self, other):
        n1 = self * other
        self.n = n1.n
        return self

    def __truediv__(self, other):
        if type(other) == int or type(other) == float:
            return self / BigNumber(other)
        n1, p1 = self.n
        n2, p2 = other.n
        dd = len(n1) - p1 - len(n2) + p2
        n3 = BigNumber(self.sign * other.sign * int(n1) / int(n2), -dd)
        return n3

    def __rtruediv__(self, other):
        return BigNumber(other) / self

    def __idiv__(self, other):
        n1 = self / other
        self.n = n1.n
        return self

    def __pow__(self, power, modulo=None):
        if type(power) != int:
            raise ValueError
        if power < 0:
            raise ValueError
        n, p = self.n
        dd = (-len(n) + 1 + p) * power
        n1 = BigNumber(int(n) ** int(power), dd)
        if self.sign == -1:
            if power % 2:
                n1.sign = -1
        return n1

    def __rpow__(self, other):
        return other ** int(self)

    def __eq__(self, other):
        if type(other) == int or type(other) == float:
            return self == BigNumber(other)
        n1, p1 = self.n
        n2, p2 = other.n
        return (n1 == n2) and (p1 == p2) and (self.sign == other.sign)

    def __gt__(self, other):
        if type(other) == int or type(other) == float:
            return self > BigNumber(other)
        n1, p1 = self.n
        n2, p2 = other.n
        if self.sign != other.sign:
            return self.sign > other.sign
        if p1 > p2:
            flag = True
        elif p1 < p2:
            flag = False
        else:
            n1 += '0' * (BigNumber.p - len(n1))
            n2 += '0' * (BigNumber.p - len(n2))
            if int(n1) > int(n2):
                flag = True
            else:
                flag = False
        if self.sign == 1:
            return flag
        else:
            return not flag

    def __ge__(self, other):
        if type(other) == int or type(other) == float:
            return self >= BigNumber(other)
        return self > other or self == other

    def __lt__(self, other):
        if type(other) == int or type(other) == float:
            return BigNumber(other) > self
        return other > self

    def __le__(self, other):
        if type(other) == int or type(other) == float:
            return BigNumber(other) >= self
        return other >= self

    def __str__(self):
        n, p = self.n
        if -5 < p < 5:
            return str(float(self))
        if len(n) > 1:
            n = n[0] + '.' + n[1:3]
        if self.sign == -1:
            sign = '-'
        else:
            sign = ''
        return sign + n + 'e{}'.format(p)

    def __repr__(self):
        return str(self)

    def __int__(self):
        n, p = self.floor().n
        n += '0' * (p - len(n) + 1)
        if self.sign == -1:
            n = '-' + n
        return int(n)

    def __float__(self):
        n, p = self.n
        if n == '0':
            return 0.0
        if self.sign == -1:
            sign = '-'
        else:
            sign = ''
        if p < 0:
            n = '0.' + '0' * (-p - 1) + n
            return float(sign + n)
        if p < len(n) - 1:
            n = n[:p + 1] + '.' + n[p + 1:]
            return float(sign + n)
        n += '0' * (p - len(n) + 1)
        return float(sign + n)


def log(num, base=10):
    if not isinstance(num, BigNumber):
        num = BigNumber(num)
    n, p = num.n
    p -= len(n) - 1
    n1 = BigNumber(math.log(int(n), base))
    if base == 10:
        n1 += p
    else:
        n1 += p * math.log(10, base)
    return n1


def json_load(f):
    return json.load(f, cls=MyJsonDecoder)


def json_dump(obj, f):
    return json.dump(obj, f, indent=2, ensure_ascii=False, cls=MyJsonEncoder)


def json_dumps(obj):
    return json.dumps(obj, cls=MyJsonEncoder)


def json_loads(obj):
    return json.loads(obj, cls=MyJsonDecoder)


if __name__ == '__main__':
    a = BigNumber(10)
    b = BigNumber(1e32)
    print(int(a + b))
