from app.database.db import get_connection

questions = [

# PYTHON EASY

("python","easy","theory","What is a Python list?","A list is a mutable ordered collection."),
("python","easy","theory","What is a tuple in Python?","A tuple is an immutable ordered collection."),
("python","easy","theory","What is a dictionary?","A dictionary stores key value pairs."),
("python","easy","coding","Write code to reverse a string.","Use slicing: s[::-1]."),
("python","easy","theory","What is indentation in Python?","Indentation defines code blocks."),

# PYTHON MEDIUM

("python","medium","coding","Write a function to find factorial.","Use recursion or loop."),
("python","medium","theory","Explain generators.","Generators produce values lazily using yield."),
("python","medium","theory","What are decorators?","Functions that wrap other functions."),
("python","medium","coding","Write a palindrome checker.","Compare string with reverse."),

# PYTHON HARD

("python","hard","theory","Explain GIL.","Global Interpreter Lock prevents multiple threads executing Python bytecode simultaneously."),
("python","hard","theory","Explain metaclasses.","Classes used to create classes."),
("python","hard","coding","Implement LRU cache.","Use ordered dictionary."),

# SQL EASY

("sql","easy","theory","What is a primary key?","Unique identifier for table rows."),
("sql","easy","theory","What is a foreign key?","Reference to another table."),
("sql","easy","coding","Select all rows from table.","SELECT * FROM table;"),

# SQL MEDIUM

("sql","medium","coding","Find second highest salary.","Use ORDER BY DESC LIMIT OFFSET."),
("sql","medium","theory","Explain joins.","Joins combine rows from tables."),
("sql","medium","coding","Count employees per department.","Use GROUP BY."),

# SQL HARD

("sql","hard","coding","Write recursive query.","Use WITH RECURSIVE."),
("sql","hard","theory","Explain query optimization.","Improve query execution speed."),

# ML

("ml","easy","theory","What is supervised learning?","Learning with labeled data."),
("ml","easy","theory","What is training data?","Dataset used to train models."),
("ml","medium","theory","What is overfitting?","Model memorizes training data."),
("ml","medium","theory","Explain cross validation.","Technique to evaluate model."),
("ml","hard","theory","Explain bias variance tradeoff.","Balance between underfitting and overfitting."),

]

conn = get_connection()
cursor = conn.cursor()

for q in questions:

    cursor.execute(
        """
        INSERT INTO question_bank
        (role, difficulty, topic, question, expected_answer)
        VALUES (%s,%s,%s,%s,%s)
        """,
        q
    )

conn.commit()
conn.close()

print("Question bank seeded successfully.")