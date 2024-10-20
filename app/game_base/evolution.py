import time
import json
import numpy as np
import os
import threading
from threading import Lock
from .big_number import json_dump, json_load, BigNumber, log, json_dumps, json_loads


def neutral_speed(level):
    if level <= 100:
        speed = 0.1 * level
    elif level <= 1000:
        speed = 10 + 0.045 * (level - 100)
    elif level <= 10000:
        speed = 50.5 + 0.004 * (level - 1000)
    else:
        speed = 86.5 + 0.0003 * (level - 10000)
    return speed


def format_time(sec):
    sec = int(sec)
    if sec < 60:
        return '{}秒'.format(sec)
    mini = sec // 60
    if sec < 60 * 60:
        return '{}分钟 {}秒'.format(mini, sec % 60)
    hour = mini // 60
    if mini < 24 * 60:
        return '{}小时 {}分钟'.format(hour, mini % 60)
    day = hour // 24
    return '{}天 {}小时'.format(day, hour % 24)


def format_number(n):
    if n < 100000:
        return n
    p = int(np.log10(float(n)))
    return '{:.2f}e{}'.format(n / 10 ** p, p)


class EvoManager:
    def __init__(self, data_dir, configure):
        if not os.path.exists(data_dir + 'data'):
            os.mkdir(data_dir + 'data')
        self.data_dir = data_dir
        self.configure = configure
        self.data = {}
        self.load_configure()
        threading.Thread(target=self.check_kill, daemon=True).start()

    def get_evo(self, item):
        if item not in self.data:
            self.load_account_data(item)
        return self.data[item]

    def load_configure(self):
        with open(self.data_dir + self.configure, encoding='utf-8') as f:
            data = json_load(f)
        self.configure = data

    def load_account_data(self, id_):
        filename = self.data_dir + 'data/' + '{}.json'.format(id_)
        if not os.path.exists(filename):  # 创建账户
            data = self.configure['initValue']
            data['lastUpdate'] = time.time()
        else:
            with open(filename, encoding='utf-8') as f:
                data = json_load(f)
        evo = Evolution(data, self.configure)
        evo.correct()
        self.data[id_] = evo

    def check_kill(self):
        while True:
            for id_ in list(self.data):
                self.save(id_)
                if time.time() - self.get_evo(id_).data['lastUpdate'] > 60 * 5:
                    del self.data[id_]
            time.sleep(10)

    def save(self, id_):
        if id_ not in self.data:
            return
        filename = self.data_dir + 'data/' + '{}.json'.format(id_)
        self.data[id_].save(filename)

    def rank(self, id_):
        return self.get_evo(id_).rank(self.data_dir + 'data/')

    def update(self, id_):
        return self.get_evo(id_).update()

    def buy(self, id_, way, item_num, num):
        return self.get_evo(id_).buy(way, item_num, num)

    def auto_buy(self, id_):
        return self.get_evo(id_).set_auto_buy()


class Evolution:

    def __init__(self, data, configure):
        self.lock = Lock()
        self.data = data
        self.configure = configure
        self.update_msg()

    def correct(self):
        if 'storage' not in self.data['thunder']:
            self.data['thunder']['storage'] = 0
        if 'explodeNum' not in self.data['dark']:
            self.data['dark']['explodeNum'] = 0
        if 'record' not in self.data:
            self.data['record'] = {}
        if 'summer' not in self.data['record']:
            date = time.localtime(time.time() - 3600 * 24)
            self.data['record']['summer'] = {'daily': '{}-{}'.format(*date[1:3])}
        if 'mail' not in self.data:
            self.data['mail'] = []
        if 'science' not in self.data['wisdom']:
            self.data['wisdom']['science'] = 0
        if 'autoBuy' not in self.data:
            self.data['autoBuy'] = False

    def save(self, filename):
        with open(filename, 'w', encoding='utf-8') as f:
            json_dump(self.data, f)

    def update(self):
        with self.lock:
            dt = int(time.time() - self.data['lastUpdate'])
            msg = self.data['mail']
            self.data['mail'] = []
            max_off_line = 24 * 3600
            half_time = 24 * 60 * 60
            if dt > max_off_line:  # 最大离线时间
                msg.append(['离线收益', ['您已离线 ' + format_time(dt), '实际收益 ' + format_time(max_off_line // 2)]])
                self.calculate(max_off_line // 2)
            elif dt > half_time:  # 收益减半时间
                msg.append(['离线收益', ['您已离线 ' + format_time(dt), '实际收益 ' + format_time(dt // 2)]])
                self.calculate(dt // 2)
            else:
                summer = self.data['record']['summer']
                date = time.localtime()
                if date[3:5] == (12, 0):
                    now = time.strftime('%m-%d', time.localtime())
                    if now != summer['daily']:
                        summer['daily'] = now
                        num = self.data['wisdom']['speed'] * 2 * 3600
                        self.data['wisdom']['num'] += num
                        msg.append(['夏日活动', ['夏日活动每日准点奖励已发放', '获得 {:.0f}智慧'.format(num)]])
                if date[3] in [12, 20, 21]:
                    self.calculate(2 * dt)
                else:
                    self.calculate(dt)
            self.data['lastUpdate'] += dt
            self.update_msg()
            if self.data['autoBuy']:
                self.auto_buy()
            return json_dumps(self.data), msg

    def update_msg(self):
        self.update_particle()
        self.update_thunder()
        self.update_dirt()
        self.update_wisdom()
        self.update_dark()

    def update_particle(self):
        # 计算粒子
        items = self.data['items']
        if items[-1]['num'] >= 100:  # 添加下一种物质
            if len(self.configure['items']) <= len(items):
                pass
            else:
                name = self.configure['items'][len(items)]
                items.append({
                    "name": name,
                    "num": BigNumber(0),
                    "produceLevel": 1,
                    "copyLevel": 1
                })
        for i, item in enumerate(items):
            # 计算生产速度
            item['unitSpeed'] = (i + 1) * BigNumber(2) ** (item['produceLevel'] - 1)
            # 计算价格
            price = [10 * BigNumber(90) ** i, 1]
            if i > 0:
                price.append(BigNumber(10) ** (i + 1))
            item['price'] = price
            if i >= len(self.configure['items']) - 1:
                item['copyPrice'] = -1
            else:
                item['copyPrice'] = BigNumber(10) ** (items[i]['copyLevel'] - 1)
            item['producePrice'] = 66 * BigNumber(700) ** (items[i]['produceLevel'] - 1)

    def update_thunder(self):
        # 计算雷电
        thunder = self.data['thunder']
        thunder['speed'] = thunder['chaos'] * BigNumber(1.1) ** (thunder['material'] - 1) * (
                1 + (thunder['chaos'] + 20) * thunder['secret'] / 100)
        if thunder['secret'] >= 5:
            thunder['secretPrice'] = -1
        else:
            thunder['secretPrice'] = [BigNumber(10) ** (3 * thunder['secret'] + 6),
                                      BigNumber(10) ** (2 * thunder['secret'] + 4)]
        thunder['chaosPrice'] = 30 * BigNumber(10) ** thunder['chaos']
        thunder['materialPrice'] = 10 * BigNumber(2.5) ** (thunder['material'] - 1)

    def update_dirt(self):
        # 计算尘埃
        dirt = self.data['dirtItem']
        dirt_speed = BigNumber(0)
        if dirt[-1]['num'] > 100 and len(dirt) < len(self.configure['dirtItems']):  # 添加下一种物质
            name = self.configure['dirtItems'][len(dirt)]
            dirt.append({
                "name": name,
                "num": BigNumber(0),
                "produceLevel": 1,
                "copyLevel": 1
            })
        for i, item in enumerate(dirt):
            # 改名字
            item['name'] = self.configure['dirtItems'][i] + self.configure['number'][item['produceLevel'] - 1]
            # 计算生产速度
            item['unitSpeed'] = 0.07 * BigNumber(45) ** (i + 11 * (item['produceLevel'] - 1))
            dirt_speed += item['unitSpeed'] * item['num']
            # 计算价格
            item['price'] = [750 * BigNumber(450) ** i, 1]
            item['copyPrice'] = [100 * BigNumber(500) ** (item['copyLevel'] - 1),
                                 BigNumber(50) ** (item['copyLevel'] - 1)]
            if item['produceLevel'] >= len(self.configure['number']):
                item['producePrice'] = -1
            else:
                item['producePrice'] = [item['num'],
                                        750 * BigNumber(450) ** (i + 11 * item['produceLevel'])]
        self.data['dirtSpeed'] = dirt_speed

    def update_wisdom(self):
        items = self.data['items']
        thunder = self.data['thunder']
        # 计算智慧
        wisdom = self.data['wisdom']
        wisdom['neutralSpeed'] = neutral_speed(wisdom['neutral'])
        if self.data['particle'] < 3.33e12:
            wisdom['speed'] = 0
        else:
            wisdom['speed'] = BigNumber(0.1) * (wisdom['thinking'] + 1) * (1 + wisdom['neutralSpeed'] / 100)
        if wisdom['thinking'] >= 4:
            wisdom['thinkingPrice'] = -1
        else:
            wisdom['thinkingPrice'] = [333 * BigNumber(10) ** (7 + 6 * wisdom['thinking']),
                                       3330 * BigNumber(10) ** (2 * wisdom['thinking']),
                                       [625, 2500, 10000, 36000][wisdom['thinking']]]
        wisdom['brainPrice'] = [1, 10]
        wisdom['neutralPrice'] = [1, 10]
        wisdom['maxContain'] = BigNumber(10000) * (wisdom['thinking'] + 1) * (1 + 0.005 * wisdom['brainLevel'])
        wisdom['sciencePrice'] = [1, 100]
        # 计算科技所得
        tech = wisdom['technology']
        science = BigNumber(wisdom['science']) * 0.0006
        wisdom['scienceAdd'] = science
        tech[0]['gain'] = 2400 * (1 + science)
        tech[1]['gain'] = 15 * 60 * (1 + science)
        tech[2]['gain'] = items[0]['unitSpeed'] * items[0]['num'] * 10000 * (1 + science)
        tech[3]['gain'] = self.data['dirtSpeed'] * 10000 * (1 + science)

    def update_dark(self):
        items = self.data['items']
        thunder = self.data['thunder']
        wisdom = self.data['wisdom']
        tech = wisdom['technology']
        thunder_max_copy = 1e5 * (1 + wisdom['scienceAdd'])
        # 计算暗物质获得
        dark = self.data['dark']
        dark['gain'] = [0.2, 0, 0]
        if thunder['chaos'] > 40:
            dark['gain'][1] = 8000 * BigNumber(1.25) ** (thunder['chaos'] - 41)
        if thunder['material'] >= 80:
            dark['gain'][2] = 8000 * BigNumber(1.12) ** (thunder['material'] - 80)
        # 计算暗能力
        num = 0
        for item in dark['ability']:
            if item['state'] != -1:
                num += 1
        dark['abilityNum'] = num
        ability = dark['ability']
        for item in ability:
            item['price'] = BigNumber(15625) ** num

        if ability[0]['state'] != -1:  # 粒子爆炸
            prop = [1.212, 1.179, 1.218, 1.149, 1.179, 1.212, 1.277, 1.372, 1.592, 2.533, 2, 1.364, 1.83333333]
            speeds = [40.034 * log(ability[0]['state'] + 1)]
            for i in range(len(prop)):
                speeds.append(speeds[-1] / prop[i])
            ability[0]['add'] = speeds
            for i in range(min(len(speeds), len(items))):
                items[i]['unitSpeed'] *= 1 + speeds[i] / 100
        if ability[1]['state'] != -1:  # 风起云涌
            ability[1]['add'] = 194.995 * log(ability[1]['state'] + 1)
            thunder['speed'] *= 1 + ability[1]['add'] / 100
        if ability[2]['state'] != -1:  # 沙尘风暴
            ability[2]['add'] = 470.455 * log(ability[2]['state'] + 1)
            self.data['dirtSpeed'] *= 1 + ability[2]['add'] / 100
            for i, item in enumerate(self.data['dirtItem']):
                item['unitSpeed'] *= 1 + ability[2]['add'] / 100
            tech[3]['gain'] *= 1 + ability[2]['add'] / 100
        if ability[3]['state'] != -1:  # 黑暗科学
            ability[3]['add'] = 86.045 * log(ability[3]['state'] + 1)
            for i in range(4):
                tech[i]['gain'] *= 1 + ability[3]['add'] / 100
            thunder_max_copy *= 1 + ability[3]['add'] / 100
        if ability[4]['state'] != -1:  # 高级智慧
            ability[4]['add'] = [min(8.093 * log(ability[4]['state'] + 1), 100),
                                 min(11.958 * log(ability[4]['state'] + 1), 100)]
            wisdom['speed'] *= 1 + ability[4]['add'][0] / 100
            wisdom['maxContain'] *= 1 + ability[4]['add'][1] / 100
        if ability[5]['state'] != -1:  # 三位一体
            ability[5]['add'] = [1228.658 * log(ability[5]['state'] + 1),
                                 130.065 * log(ability[5]['state'] + 1),
                                 270.102 * log(ability[5]['state'] + 1)]
            tech[0]['gain'] *= 1 + ability[5]['add'][2] / 100
            tech[2]['gain'] *= 1 + ability[5]['add'][0] / 100
            tech[3]['gain'] *= 1 + ability[5]['add'][1] / 100
        if ability[6]['state'] != -1:  # 疯狂复制
            ability[6]['add'] = 155.077 * log(ability[6]['state'] + 1)
            thunder_max_copy *= 1 + ability[6]['add'] / 100
        if ability[7]['state'] != -1:  # 斗转星移
            ability[7]['add'] = 30.072 * log(ability[7]['state'] + 1)
            tech[1]['gain'] *= 1 + ability[7]['add'] / 100
        if ability[8]['state'] != -1:  # 探索黑暗
            ability[8]['add'] = min(4.557 * log(ability[8]['state'] + 1), 40)
            dark['gain'][0] += ability[8]['add'] / 100
        if ability[9]['state'] != -1:  # 暗质转化
            ability[9]['add'] = 42.569 * log(ability[9]['state'] + 1)
            dark['gain'][1] *= 1 + ability[9]['add'] / 100
            dark['gain'][2] *= 1 + ability[9]['add'] / 100

        hour = int(tech[1]['gain'] / 3600)
        tech[1]['price'] = min(5000, 500 * hour + 500)
        thunder['speed'] += self.data['dark']['energy'] / 10
        thunder_max_copy *= thunder['speed']
        tech[0]['gain'] *= thunder['speed']
        tech[4]['gain'] = min(thunder_max_copy, thunder['num'] + thunder['storage'])

    def calculate(self, dt, wisdom_rise=True):
        # 物质增长
        items = self.data['items']
        n = len(items) + 1
        A = [[0 for _ in range(n)] for _ in range(n)]
        num = [self.data['particle']] + [item['num'] for item in items]
        c = BigNumber(1)
        for i in range(n):
            A[i][i] = 1
        for i in range(n - 1):
            A[i][i + 1] = items[i]['unitSpeed']
        for i in range(n - 2):
            if i + 1 == dt:
                break
            for j in range(n - 2 - i):
                A[j][i + j + 2] = A[j][i + j + 1] * A[i + j + 1][i + j + 2]
        for i in range(n):
            for j in range(n - i):
                A[j][i + j] *= c
            if i == dt:
                break
            c *= (dt - i) / (i + 1)
        for i in range(n):
            s = BigNumber(0)
            for j in range(n - i):
                s += A[i][i + j] * num[i + j]
            num[i] = s
        self.data['particle'] = num[0]
        for i in range(len(items)):
            items[i]['num'] = num[i + 1]
        # 雷电增长
        thunder = self.data['thunder']
        thunder['num'] += thunder['speed'] * dt
        # 尘埃增长
        self.data['dirt'] += int(self.data['dirtSpeed']) * dt
        # 智慧增长
        if wisdom_rise:
            wisdom = self.data['wisdom']
            wisdom['num'] += wisdom['speed'] * dt
            if wisdom['num'] > wisdom['maxContain']:
                wisdom['num'] = wisdom['maxContain']

    def wisdom_spent(self, num):
        num = BigNumber(num)
        dark = self.data['dark']
        thunder = self.data['thunder']
        if dark['explodeNum'] == 0 and thunder['chaos'] <= 40 and thunder['material'] < 80:
            return
        price = dark['explodePrice']
        initial_price = 5e6 * 1.12 ** (dark['explodeNum'])
        ps = [0.73, 0.325, 0.0215, 0.0194, 0.0171]
        ps = [p * initial_price for p in ps]
        ps.append(77779 * 1.12 ** dark['explodeNum'])
        ks = [50, 30, 16, 0.566, 0.206, 0.023]
        for i in range(len(ps)):
            if price > ps[i]:
                break
        else:
            return
        delta = price - ps[i]
        need = delta / ks[i]
        if need < num:
            dark['explodePrice'] = BigNumber(ps[i])
            self.wisdom_spent(num - need)
        else:
            price -= ks[i] * num
            dark['explodePrice'] = price

    def buy(self, way, item_num=None, num=None):
        with self.lock:
            buy_item_num = {'itemBuy': self.item_buy,
                            'dirtBuy': self.dirt_buy,
                            'darkAbilityBuy': self.dark_ability_buy}
            buy_item = {'itemCopyBuy': self.item_copy_buy,
                        'itemProduceBuy': self.item_produce_buy,
                        'dirtCopyBuy': self.dirt_copy_buy,
                        'dirtProduceBuy': self.dirt_produce_buy,
                        'wisdomTechBuy': self.wisdom_tech_buy,
                        'darkAbilityUnlock': self.dark_ability_unlock}
            buy_num = {'thunderStorageBuy': self.thunder_storage_buy,
                       'wisdomBrainBuy': self.wisdom_brain_buy,
                       'wisdomNeutralBuy': self.wisdom_neutral_buy,
                       'wisdomScienceBuy': self.wisdom_science_buy}
            buy = {'thunderChaosBuy': self.thunder_chaos_buy,
                   'thunderMaterialBuy': self.thunder_material_buy,
                   'thunderSecretBuy': self.thunder_secret_buy,
                   'wisdomThinkingBuy': self.wisdom_thinking_buy,
                   'darkExplode': self.dark_explode}
            flag = None
            if way in buy_item_num:
                flag = buy_item_num[way](int(item_num), BigNumber(json_loads(num)).floor())
            elif way in buy_item:
                flag = buy_item[way](int(item_num))
            elif way in buy_num:
                flag = buy_num[way](BigNumber(json_loads(num)).floor())
            elif way in buy:
                flag = buy[way]()
            if flag is None:
                return 'not exist'
            elif flag:
                self.update_msg()
                return json_dumps(self.data)
            else:
                return 'not enough'

    def set_auto_buy(self):
        self.data['autoBuy'] = not self.data['autoBuy']
        return {'autoBuy': self.data['autoBuy']}

    def auto_buy(self):
        c = 0
        m = 30
        for i in range(len(self.data['items'])):
            while self.item_produce_buy(i) and c < m:
                c += 1
                self.update_msg()
            c = 0
            while self.item_copy_buy(i, True) and c < m:
                c += 1
                self.update_msg()
        for i in range(len(self.data['dirtItem'])):
            c = 0
            while self.dirt_produce_buy(i) and c < m:
                c += 1
                self.update_msg()
        c = 0
        while self.thunder_chaos_buy() and c < m:
            c += 1
            self.update_msg()
        c = 0
        while self.thunder_material_buy() and c < m:
            c += 1
            self.update_msg()

    def item_buy(self, item_num, num):
        price = self.data['items'][item_num]['price']
        to_buy = list()
        to_buy.append(self.data['particle'] / price[0])
        to_buy.append(self.data['thunder']['num'] / price[1])
        if item_num > 0:
            to_buy.append(self.data['items'][item_num - 1]['num'] / price[2])
        to_buy = min(to_buy).floor()
        if to_buy == 0:
            return False
        elif num > to_buy:
            num = to_buy
        self.data['particle'] -= price[0] * num
        self.data['thunder']['num'] -= price[1] * num
        if item_num > 0:
            self.data['items'][item_num - 1]['num'] -= price[2] * num
        self.data['items'][item_num]['num'] += 2 ** (self.data['items'][item_num]['copyLevel'] - 1) * num
        return True

    def item_copy_buy(self, item_num, auto=False):
        if item_num + 1 >= len(self.data['items']):
            return False
        price = self.data['items'][item_num]['copyPrice']
        if auto:
            if self.data['items'][item_num + 1]['num'] < price * 1e10:
                return False
        else:
            if self.data['items'][item_num + 1]['num'] < price:
                return False
        self.data['items'][item_num + 1]['num'] -= price
        self.data['items'][item_num]['copyLevel'] += 1
        return True

    def item_produce_buy(self, item_num):
        if item_num >= len(self.data['items']):
            return False
        price = self.data['items'][item_num]['producePrice']
        if self.data['items'][item_num]['num'] < price:
            return False
        self.data['items'][item_num]['num'] -= price
        self.data['items'][item_num]['produceLevel'] += 1
        return True

    def thunder_chaos_buy(self):
        price = self.data['thunder']['chaosPrice']
        if self.data['particle'] < price:
            return False
        dark_gain = self.data['dark']['gain']
        if np.random.random() < dark_gain[0]:
            self.data['dark']['num'] += dark_gain[1]
        self.data['particle'] -= price
        self.data['thunder']['chaos'] += 1
        return True

    def thunder_material_buy(self):
        price = self.data['thunder']['materialPrice']
        if self.data['dirt'] < price:
            return False
        dark_gain = self.data['dark']['gain']
        if np.random.random() < dark_gain[0]:
            self.data['dark']['num'] += dark_gain[2]
        self.data['dirt'] -= price
        self.data['thunder']['material'] += 1
        return True

    def thunder_secret_buy(self):
        if self.data['thunder']['secret'] >= 5:
            return False
        price = self.data['thunder']['secretPrice']
        if self.data['particle'] < price[0]:
            return False
        if self.data['dirt'] < price[1]:
            return False
        self.data['particle'] -= price[0]
        self.data['dirt'] -= price[1]
        self.data['thunder']['secret'] += 1
        return True

    def thunder_storage_buy(self, num):
        thunder = self.data['thunder']
        total = thunder['num'] + thunder['storage']
        if num > total:
            num = total
        thunder['storage'] = num
        thunder['num'] = total - num
        return True

    def dirt_buy(self, item_num, num):
        price = self.data['dirtItem'][item_num]['price']
        to_buy = list()
        to_buy.append(self.data['particle'] / price[0])
        to_buy.append(self.data['thunder']['num'] / price[1])
        to_buy = min(to_buy).floor()
        if to_buy == 0:
            return False
        elif num > to_buy:
            num = to_buy
        self.data['particle'] -= price[0] * num
        self.data['thunder']['num'] -= price[1] * num
        self.data['dirtItem'][item_num]['num'] += 2 ** (self.data['dirtItem'][item_num]['copyLevel'] - 1) * num
        return True

    def dirt_copy_buy(self, item_num):
        particle, thunder = self.data['dirtItem'][item_num]['copyPrice']
        if self.data['particle'] < particle:
            return False
        if self.data['thunder']['num'] < thunder:
            return False
        self.data['particle'] -= particle
        self.data['thunder']['num'] -= thunder
        self.data['dirtItem'][item_num]['copyLevel'] += 1
        return True

    def dirt_produce_buy(self, item_num):
        item = self.data['dirtItem'][item_num]
        if item['produceLevel'] >= len(self.configure['number']):
            item['producePrice'] = -1
        price = item['producePrice']
        if price == -1 or self.data['particle'] < price[1]:
            return False
        self.data['particle'] -= price[1]
        item['num'] = 0
        item['produceLevel'] += 1
        return True

    def wisdom_thinking_buy(self):
        wisdom = self.data['wisdom']
        if wisdom['thinking'] >= 4:
            return False
        price = wisdom['thinkingPrice']
        if self.data['particle'] < price[0]:
            return False
        if self.data['thunder']['num'] < price[1]:
            return False
        if wisdom['num'] < price[2]:
            return False
        self.data['particle'] -= price[0]
        self.data['thunder']['num'] -= price[1]
        wisdom['num'] -= price[2]
        wisdom['thinking'] += 1
        self.wisdom_spent(price[2])
        return True

    def wisdom_brain_buy(self, num):
        wisdom = self.data['wisdom']
        price = wisdom['brainPrice']
        if self.data['thunder']['num'] < price[0] * num:
            return False
        if wisdom['num'] < price[1] * num:
            return False
        self.data['thunder']['num'] -= price[0] * num
        wisdom['num'] -= price[1] * num
        self.wisdom_spent(price[1] * num)
        wisdom['brainLevel'] += int(num)
        return True

    def wisdom_tech_buy(self, item_num):
        wisdom = self.data['wisdom']
        tech = wisdom['technology'][item_num]
        if wisdom['num'] < tech['price']:
            return False
        wisdom['num'] -= tech['price']
        self.wisdom_spent(tech['price'])
        gain = tech['gain']
        if item_num == 0 or item_num == 4:
            self.data['thunder']['num'] += gain
        elif item_num == 1:
            self.calculate(int(gain), False)
        elif item_num == 2:
            self.data['particle'] += gain
        elif item_num == 3:
            self.data['dirt'] += gain
        return True

    def wisdom_neutral_buy(self, num):
        wisdom = self.data['wisdom']
        price = wisdom['neutralPrice']
        if wisdom['thinking'] < 3:
            return False
        if self.data['thunder']['num'] < price[0] * num:
            return False
        if wisdom['num'] < price[1] * num:
            return False
        self.data['thunder']['num'] -= price[0] * num
        wisdom['num'] -= price[1] * num
        self.wisdom_spent(price[1] * num)
        wisdom['neutral'] += int(num)
        return True

    def wisdom_science_buy(self, num):
        wisdom = self.data['wisdom']
        price = wisdom['sciencePrice']
        if wisdom['thinking'] < 4:
            return False
        if self.data['thunder']['num'] < price[0] * num:
            return False
        if wisdom['num'] < price[1] * num:
            return False
        self.data['thunder']['num'] -= price[0] * num
        wisdom['num'] -= price[1] * num
        self.wisdom_spent(price[1] * num)
        wisdom['science'] += int(num)
        return True

    def dark_explode(self):
        if self.data['wisdom']['num'] < self.data['dark']['explodePrice']:
            return False
        dark = self.data['dark']
        dark['energy'] += dark['num']
        dark['num'] = BigNumber(0)
        dark['explodeNum'] += 1
        dark['explodePrice'] = BigNumber(5e6 * 1.05 ** (dark['explodeNum']))
        self.data = self.configure['initValue']
        self.data['lastUpdate'] = time.time()
        self.data['dark'] = dark
        self.correct()
        return True

    def dark_ability_unlock(self, item_num):
        dark = self.data['dark']
        if dark['energy'] < dark['ability'][item_num]['price']:
            return False
        dark['energy'] -= dark['ability'][item_num]['price']
        dark['ability'][item_num]['state'] = BigNumber(0)
        return True

    def dark_ability_buy(self, item_num, num):
        dark = self.data['dark']
        if dark['energy'] < num:
            return False
        dark['energy'] -= num
        dark['ability'][item_num]['state'] += num
        return True

    def rank(self, dirname):
        ranks = []
        for file in os.listdir(dirname):
            with open(dirname + file, encoding='utf-8') as f:
                data = json_load(f)
            if data['items'][-1]['num'] == 0:
                del data['items'][-1]
            if not data['items']:
                continue
            item = data['items'][-1]
            ranks.append([file.split('.')[0], item['name'], item['num'], len(data['items'])])
        ranks = sorted(ranks, key=lambda player: (player[3], player[2]), reverse=True)
        return ranks


evo_manager = EvoManager('source/evolution/', 'configure.json')
