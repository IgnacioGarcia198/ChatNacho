CREATE TABLE users(
    user_id INT(4) NOT NULL AUTO_INCREMENT,
    user_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY (user_id)  
)

CREATE TABLE chat(
    message_id INT(11) NOT NULL AUTO_INCREMENT,
    user_name VARCHAR(255) NOT NULL,
    posted_on DATETIME NOT NULL,
    message TEXT NOT NULL,
    PRIMARY KEY (message_id),
    FOREIGN KEY (user_name) REFERENCES users(user_name) 
)