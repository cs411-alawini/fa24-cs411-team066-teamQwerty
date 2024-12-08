# fa24-cs411-team066-teamQwerty

## 1. Install Node.js dependencies.

Go to the `fitness-project` folder and run:

```bash
npm install
```

## 2. Set up MySQL.

1. Install MySQL on your system if not already installed.
   - For Windows: [MySQL Installer](https://dev.mysql.com/downloads/installer/)
   - For Mac: `brew install mysql`
   - For Linux: `sudo apt-get install mysql-server`

2. Start the MySQL server (Linux only):
   ```bash
   brew service mysql start
   ```

3. Connect to the MySQL server:
   ```bash
   mysql -u root -p
   ```

4. Create a new database:
   ```bash
   CREATE DATABASE database_name;
   ```

5. Update `app.py` to include your MySQL credentials:
   ```python
   app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://<username>:<password>@localhost/<database_name>'
   ```

6. Run the following command to initiate the database:
   ```bash
   python3 setup.py
   ```

## 3. Start API server.

Navigate to the `fa24-cs411-team066-teamQwerty` folder and run:

```bash
pip install -r requirements.txt
python3 app.py
```

## 4. Run the WebPage.

Navigate to the `fitness-project` folder and run:

```bash
npm start
```

Navigate to your local browser to see the webpage.
