CREATE DATABASE garama_prenotazioni;
USE UTENTI_PREN;
CREATE TABLE utenti(
id INT PRIMARY KEY AUTO_INCREMENT,
username VARCHAR(50) PRIMARY KEY NOT NULL,
password VARCHAR(50) NOT NULL,
nome VARCHAR(50),
cognome VARCHAR(50)
);
CREATE TABLE mete(
id INT PRIMARY KEY AUTO_INCREMENT,
nome VARCHAR(100) NOT NULL,
descrizione TEXT,
prezzo DECIMAL(10,2),
posti_totali INT,
foto_url VARCHAR(255)
);
CREATE TABLE prenotazioni(
id INT PRIMARY KEY AUTO_INCREMENT,
id_utente INT,
id_meta INT,
data_prenotazione DATE,
num_persone INT,
FOREIGN KEY (id_utente) REFERENCES utenti(id) ON DELETE CASCADE,
FOREIGN KEY (id_meta) REFERENCES mete(id) ON DELETE CASCADE
);
INSERT INTO utenti (id,username, password, nome, cognome) VALUES
(1,"FedeMani",PASSWORD("1234"),"Federico", "Maniglio"),
(2,"acosta",PASSWORD("5678"),"Alberto","Costa"),
(3,"sbalestro",PASSWORD("letmein"),"Sergio","Balestro"),
(4,"mcolombara",PASSWORD("mcolomba"),"Marco","Colombara");
INSERT INTO mete (id,nome,descrizione,prezzo,posti_totali,foto_url)
VALUES (1,"Barcellona","Città spagnola",400,80,"Barcellona.jpeg"),
(2,"Roma","Capitale italiana",300,100,"Roma.jpg"),
(3,"Tokyo","Capitale giapponese",600,30,"Tokyo.jpg"),
(4,"Los Angeles","Anche definita LA",500,60,"Los Angeles.jpg");