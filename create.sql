CREATE DATABASE `ichat` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
SET SQL_SAFE_UPDATES = 0;

use ichat;

-- 用户
create table if not exists accounts(
	id int primary key auto_increment,
    account varchar(20) not null unique,
    password varchar(40) not null,
    email varchar(80) not null unique,
    code varchar(20) not null unique
);


-- 邮箱验证码
create table if not exists confirm(
	id int primary key auto_increment,
    email varchar(80) not null,
    code varchar(6) not null
);

-- 云盘
create table if not exists cloud(
	id int primary key auto_increment,
    account_id int not null,
    create_time timestamp default current_timestamp not null,
    filename varchar(80) not null,
    location varchar(40) not null unique
);

-- 小说
create table if not exists books(
	id int primary key auto_increment,
	name varchar(40) not null,
    location varchar(40) not null
);

create table if not exists shelf(
    account_id int not null,
    book_id int not null,
    process decimal(7,3) not null default 0,
    last_read datetime not null default current_timestamp on update CURRENT_TIMESTAMP,
    total_time float not null default 0,
	foreign key(account_id) references accounts(id) on delete cascade,
	foreign key(book_id) references books(id) on delete cascade
);

create table if not exists read_record(
	account_id int not null,
    book_id int not null,
    process decimal(7, 3) not null,
    time datetime not null default current_timestamp,
	foreign key(account_id) references accounts(id) on delete cascade,
	foreign key(book_id) references books(id) on delete cascade
);

create view shelf_view as (
select accounts.account, accounts.name, books.name book_name, shelf.process, shelf.last_read, shelf.total_time
from books, shelf, accounts
where accounts.id = shelf.account_id and books.id = shelf.book_id
order by shelf.last_read desc
);

-- 盐选
create table if not exists salt(
	id int primary key,
    date date not null,
    title varchar(40) not null
);

-- 聊天
create table if not exists chat(
	id int primary key auto_increment,
    time datetime not null default current_timestamp,
    account_id int not null,
    msg text,
	foreign key(account_id) references accounts(id) on delete cascade
);

create table if not exists bubble(
	account_id int not null unique,
    bubble_id int,
	foreign key(account_id) references accounts(id) on delete cascade
);

-- 音乐 
create table if not exists songs(
	id int primary key auto_increment,
    song_id varchar(20) not null unique,
    song_name varchar(40) not null,
    img_url varchar(80) not null,
    song_url varchar(80) not null,
    artist_name varchar(40) not null
);

create table if not exists song_sheet(
    account_id int not null,
    song_id int not null,
	foreign key(account_id) references accounts(id) on delete cascade,
	foreign key(song_id) references songs(id) on delete cascade
);

-- 日记 
create table if not exists diary_item(
	id int primary key,
    time date not null,
    title varchar(40) not null,
    content text,
    account_id int,
	foreign key(account_id) references accounts(id) on delete set null
);

create table if not exists diary_cate(
	id int primary key,
    name varchar(20)
);

create table if not exists cate_of_diary(
    diary_id int not null,
    cate_id int not null,
	foreign key(diary_id) references diary_item(id) on delete cascade,
	foreign key(cate_id) references diary_cate(id) on delete cascade
);

create table if not exists cate_of_account(
    account_id int not null,
    cate_id int not null,
	foreign key(account_id) references accounts(id) on delete cascade,
	foreign key(cate_id) references diary_cate(id) on delete cascade
);

-- 书签
create table if not exists bark (
	id int not null,
	account_id int not null,
	url varchar(1024) not null,
    favicon_url varchar(1024),
    name varchar(40),
	foreign key(account_id) references accounts(id) on delete cascade
);

-- 游戏 
create table if not exists evolution (
	account_id int not null,
    data text,
    last_update datetime not null default current_timestamp on update CURRENT_TIMESTAMP,
	foreign key(account_id) references accounts(id) on delete cascade
);

-- 视频
create table if not exists ted_videos (
	id int auto_increment,
    title varchar(32),
    url varchar(100),
    primary key(id, title)
);

create table if not exists ted_record (
	account_id int,
    video_id int,
    time timestamp default current_timestamp not null,
    primary key(account_id, video_id)
);
