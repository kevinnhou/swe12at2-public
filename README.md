#  Jyra

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![Flask](https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white)
![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

![Jira](https://img.shields.io/badge/jira-%230A0FFF.svg?style=for-the-badge&logo=jira&logoColor=white)

**Jira Clone**, made for school assessment task.

##  Setup

> Before you start, make sure you have the following installed:

-  [**git**](https://git-scm.com/downloads): To clone the repository.

-  [**pnpm**](https://pnpm.io/installation): A modern alternative to Node.js for managing packages.

-  [**Python**](https://www.python.org/downloads): To build and serve the Flask backend.

Once you have the prerequisites installed, follow these steps:

1.  **Clone the Repository**:

```zsh

git clone https://github.com/kevinnhou/swe12at2-public.git

```

2.  **Change into Project Directory**

```zsh

cd swe12at2-public

```

3. **Set Up the Virtual Environment**

####  macOS:

```bash

python3 -m  venv  venv

source  venv/bin/activate

```

####  Windows:

```bash

python -m  venv  venv

venv\Scripts\activate

```

Once the virtual environment is activated, install the required Python modules with `pip`:

```bash

pip install  -r  requirements.txt

```

4.  **Install Frontend Dependencies**:

```zsh

pnpm install

```

5. **Set Up `.env` File**

Create a `.env` file in the root directory of the project.

Example `.env` file:

```

JWT_SECRET_KEY=<your-secret-key>

DATABASE=jyra.db

```

5. **Generate Secret Key**

To generate a secure JWT secret key, run the following command:

```zsh

openssl rand  -base64  32

```

This will output a random 32 byte base64 string that you can use as your JWT secret key.

If you prefer, you can use the following default secret key:

```

JWT_SECRET_KEY=/w0coSql0dTQ4W4NYqEAxz9UrxkmR24ASAeaIsrnw6k=

```

Replace `<your-secret-key>` in the `.env` file with the JWT secret key you generated or the one provided.

6.  **Run the Development Server**:

```zsh

pnpm run dev

```

7. Visit the app at [localhost:3000](http://localhost:3000).
