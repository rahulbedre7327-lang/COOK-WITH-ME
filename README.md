# 🍳 Cook With Me – Bachelor's Kitchen

A smart and user-friendly recipe web application designed for **hostel students, bachelors, and anyone who has limited ingredients but wants to cook a tasty meal**.

The application allows users to explore recipes, search for dishes based on available ingredients, save favorite recipes, view cooking history, and generate custom recipes using the ingredients they have.

---

## 📌 Project Overview

**Cook With Me – Bachelor's Kitchen** is a full-stack web application developed to solve a simple everyday problem:

> "I have some ingredients, but I don't know what I can cook."

The application takes the user's available ingredients and helps find a suitable recipe. If a matching recipe is not available in the database, the system can generate a suitable custom recipe based on the provided ingredients.

---

## ✨ Features

### 🏠 Dashboard
- Clean and responsive dashboard
- Search for recipes
- Browse recipes by category
- Quick access to important features
- Custom Food / Chatbot button

### 🍲 Recipe Search
- Search recipes by name
- Search using available ingredients
- Case-insensitive ingredient search
- Displays matching recipes
- Shows a message when no recipe is found

### 🥕 Custom Food
Users can enter ingredients such as:

text
Tomato
Onion
Egg
Bread
Cheese
The application can:

Accept multiple ingredients
Accept ingredient quantities
Match ingredients with stored recipes
Generate a custom recipe when no stored recipe matches
🤖 Recipe Chatbot

The project includes a cooking assistant chatbot that helps users interact with the recipe system.

The chatbot can help with:

Finding recipes
Checking available ingredients
Cooking-related questions
Suggesting dishes from ingredients

Example:

User:
I have rice, tomato and onion.

Bot:
You can make Tomato Rice.
❤️ Favorites
Save favorite recipes
Easily access saved recipes later
🕒 History
Keeps track of previously viewed/generated recipes
🌙 Dark Mode
Modern dark interface
Dark mode preference can be maintained across pages
📱 Responsive Design

The interface is designed to work on:

💻 Desktop
💻 Laptop
📱 Mobile
📟 Tablet
🛠️ Technologies Used
Frontend
HTML5
CSS3
JavaScript
Backend
Python
Flask
Flask-CORS
Database
MySQL
MySQL Connector/Python
Development Tools
Visual Studio Code
MySQL Workbench
Git
GitHub

CookWithMe/
│
├── app.py
│
├── templates/
│   ├── index.html
│   ├── dashboard.html
│   ├── recipes.html
│   ├── favorites.html
│   ├── history.html
│   ├── settings.html
│   ├── about.html
│   ├── custom-food.html
│   └── custom-food-result.html
│
├── static/
│   ├── css/
│   │   ├── style.css
│   │   ├── responsive.css
│   │   ├── custom-food.css
│   │   ├── custom-food-result.css
│   │   └── recipe.css
│   │
│   ├── js/
│   │   ├── custom-food.js
│   │   └── chatbot.js
│   │
│   ├── images/
│   │   ├── logo.png
│   │   ├── chicken-biriyani.png
│   │   └── ...
│   │
│   └── recipes/
│       ├── tomato-rice.html
│       ├── egg-fried-rice.html
│       └── ...
│
├── chatbot/
│   └── chatbot.py
│
├── requirements.txt
│
├── README.md
│
└── .gitignore

🗄️ Database Structure

The project uses a MySQL database named:

CookWithMe

Main Tables
recipes

Stores recipe information.

recipe_id
recipe_name
category
cooking_time
difficulty
servings
ingredients

Stores available ingredients.

id
name

recipe_ingredients

Connects recipes with their ingredients.

id
recipe_id
ingredient_id
quantity

🔄 How the Application Works

The basic workflow is:

User
  │
  ▼
Enter Ingredients
  │
  ▼
Frontend
  │
  ▼
Flask Backend
  │
  ▼
Search Recipe Database
  │
  ├── Recipe Found
  │       │
  │       ▼
  │   Display Recipe
  │
  └── Recipe Not Found
          │
          ▼
   Generate Custom Recipe
          │
          ▼
     Display Result
🤖 Chatbot Workflow

User enters ingredients
          │
          ▼
      Chatbot
          │
          ▼
 Understand ingredients
          │
          ▼
 Search available recipes
          │
          ▼
 ┌───────────────────┐
 │ Matching Recipe?  │
 └───────────────────┘
       │         │
      YES        NO
       │         │
       ▼         ▼
 Show Recipe   Generate
               Suggestion
       │         │
       └────┬────┘
            ▼
       User gets recipe

1. Clone the Repository
git clone https://github.com/rahulbedre7327-lang/CookWithMe.git

Move into the project directory:
cd CookWithMe

2. Create a Virtual Environment

python -m venv venv

Activate it on Windows:

venv\Scripts\activate

3. Install Dependencies
   pip install -r requirements.txt

If requirements.txt is not available:
pip install flask flask-cors mysql-connector-python

🗄️ MySQL Setup

Make sure MySQL Server is installed and running.

Create the database:
CREATE DATABASE CookWithMe;

Then create/import the required tables.

Update the database configuration in app.py:
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="YOUR_PASSWORD",
        database="CookWithMe"
    )

    ⚠️ Do not upload your real database password to GitHub. Use environment variables or a configuration file that is excluded using .gitignore.
 ▶️ Run the Application

Start the Flask server:

python app.py

The application will normally run at:

http://127.0.0.1:5000/
Open the address in your browser.

🎯 Project Objectives

The main objectives of this project are:

Help users cook with ingredients they already have.
Reduce the difficulty of deciding what to cook.
Provide simple and easy-to-follow recipes.
Help hostel students and bachelors prepare meals.
Provide custom recipe generation.
Provide an interactive cooking chatbot.
Create a responsive and user-friendly interface.
Combine frontend, backend, database, and intelligent recipe suggestions into one application.

👨‍💻 Target Users

The application is especially useful for:

🎓 College students
🏠 Hostel students
👨‍🍳 Beginners
🧑‍💻 Bachelors
👨‍👩‍👧 Home users
🥘 Anyone with limited ingredients  

🔮 Future Enhancements

Possible future improvements include:

🗣️ Voice-based cooking assistant
🤖 More advanced AI recipe generation
🌐 Online recipe synchronization
📷 Ingredient recognition using a camera
🧾 Automatic shopping-list generation
⭐ Recipe rating system
👤 User accounts and authentication
📊 Personalized recipe recommendations
🌍 Multi-language support
📱 Android application
🔔 Cooking reminders and notifications

🔐 Security

The project should follow basic security practices:

Never expose database passwords in source code.
Use environment variables for sensitive configuration.
Validate user input.
Use parameterized SQL queries.
Keep secret configuration files out of GitHub.

Example .gitignore:

venv/
__pycache__/
.env
*.pyc

📸 Project Screens

<img width="1240" height="1842" alt="image" src="https://github.com/user-attachments/assets/b1a8935d-bd57-4080-b74d-9f6cffc1dec8" />
<img width="343" height="1996" alt="image" src="https://github.com/user-attachments/assets/faefe401-e58c-4934-a448-699fa01802c2" />
<img width="1240" height="1234" alt="image" src="https://github.com/user-attachments/assets/8b2f9d86-5137-4cf1-add0-9b9088c47595" />

📚 Learning Outcomes

Through this project, we learned:

HTML page development
CSS responsive design
JavaScript DOM manipulation
Python programming
Flask web development
REST API concepts
MySQL database management
SQL queries
Frontend-backend integration
Chatbot development
Recipe matching logic
Git and GitHub
Responsive UI development

👥 Project Team

Project: Cook With Me – Bachelor's Kitchen

Domain: Web Development / Food Technology / Intelligent Recipe Recommendation

Technologies:
HTML | CSS | JavaScript | Python | Flask | MySQL

📄 License

This project is developed for educational and academic purposes.

⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

🍳 Cook With Me

"Have ingredients? Let's cook!"


### One important GitHub tip

For your actual repository, I recommend keeping the README **professional and simple**, and adding these sections at the top:

**Project title → Description → Features → Screenshots → Technologies → Installation → Database → Usage → Future Scope → Team**

If you want, I can also make you a **:contentReference[oaicite:0]{index=0}**.

