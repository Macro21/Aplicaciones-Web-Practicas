create table user (
	email varchar(100) primary key,
	password varchar(30) not null,
	fullName varchar(100) not null,
	gender char not null,
	birthdate date not null,
    image varchar(100),
    score integer not null default 0,
    constraint chk_score check (score >=0)
);

create table friends (
    userEmail varchar(100),
    petitionerEmail varchar(100),
    state integer not null check (state >=0 and state <=2),
    foreign key (userEmail) references user(email),
    foreign key (petitionerEmail) references user(email),
    primary key (userEmail, petitionerEmail)
);

create table question (
    id integer auto_increment primary key,
    question varchar(220) not null,
    nAnswer integer not null default 1
);

create table answer (
    id integer auto_increment primary key,
    idQuestion integer,
    answer varchar(100) not null,
    foreign key (idQuestion) references question (id)
);

create table userAnswer (
    userEmail varchar(100),
    idAnswer integer,
    foreign key (userEmail) references user (email),
    foreign key (idAnswer) references answer (id),
    primary key (userEmail,idAnswer)
);

create table guessedAnswer(
    userEmail varchar(100),
    friendEmail varchar(100),
    idQuestion integer,
    guessed integer not null check (guessed >=0 and guessed <=1),
    foreign key (idQuestion) references question (id),
    foreign key (userEmail) references user(email),
    foreign key (friendEmail) references user(email),
    primary key (userEmail, friendEmail,idQuestion)
);
create table galery(
    email varchar(100),
    image varchar(100),
    foreign key (email) references user(email),
    primary key (email, image)
);