from base import sql_manager
import os


def get_to_insert(ignore):
    to_insert = []
    books = os.listdir('source/novel')
    for book in books:
        n, t = os.path.splitext(book)
        if t == '.txt':
            if book not in ignore:
                to_insert.append(n)
    return to_insert


results = sql_manager('select location from books;')
# location: source/novel/xxx.txt
results = [item[0][13:] for item in results]
to_insert = get_to_insert(results)
for n in to_insert:
    sql_manager('insert into books(name, location) values("{}", "source/novel/{}.txt");'.format(n, n))
    print('《{}》成功添加到书城'.format(n))
