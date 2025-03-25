import re
import os
import sqlite3
import secrets
import string
import logging
import json
import time
from datetime import timedelta, datetime
from flask import Flask, g, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    set_access_cookies,
    set_refresh_cookies,
    unset_jwt_cookies,
)
from dotenv import load_dotenv
from flask_cors import CORS
from typing import Any, Optional

load_dotenv()

app = Flask(__name__)

CORS(
    app,
    supports_credentials=True,
    resources={
        r"/api/*": {
            "origins": ["http://localhost:3000"],
            "methods": ["GET", "POST", "OPTIONS", "PUT"],
            "allow_headers": ["Content-Type"],
            "expose_headers": ["Set-Cookie"],
        }
    },
)

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)
app.config["JWT_COOKIE_SECURE"] = True
app.config["JWT_COOKIE_CSRF_PROTECT"] = False
app.config["JWT_COOKIE_SAMESITE"] = "Strict"
app.config["DATABASE"] = os.getenv("DATABASE", "jyra.db")
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_ACCESS_COOKIE_PATH"] = "/api/"
app.config["JWT_REFRESH_COOKIE_PATH"] = "/api/refresh"

jwt = JWTManager(app)

log_filename = "api.log"
logging.basicConfig(
    filename=log_filename,
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("api_logger")


def log_action(action: str, details: dict = None):
    """
    Log user actions to the application logger.
    
    Parameters:
    ----------
    action : str
        The action being performed
    details : dict, optional
        Additional details about the action
    """
    try:
        user_id = get_jwt_identity()
    except:
        user_id = None
    log_data = {
        "timestamp": datetime.now().isoformat(),
        "action": action,
        "user_id": user_id,
        "ip_address": request.remote_addr,
    }
    if details:
        log_data["details"] = details
    logger.info(json.dumps(log_data))


@app.before_request
def before_request():
    """
    Execute before each request to measure performance.
    
    Stores the start time in the Flask global object to calculate
    request duration later.
    """
    g.start_time = time.time()


@app.after_request
def after_request(response):
    """
    Execute after each request to log request details.
    
    Parameters:
    ----------
    response : flask.Response
        The response object that will be sent to the client
        
    Returns:
    -------
    flask.Response
        The unmodified response object
    """
    duration = time.time() - g.start_time

    request_data = request.get_json(silent=True)
    if request_data and isinstance(request_data, dict):
        if "password" in request_data:
            request_data["password"] = "********"
        if "token" in request_data:
            request_data["token"] = "********"

    log_data = {
        "timestamp": datetime.now().isoformat(),
        "method": request.method,
        "path": request.path,
        "status_code": response.status_code,
        "ip_address": request.remote_addr,
        "duration": f"{duration:.4f}s",
        "request_data": request_data,
    }

    logger.info(json.dumps(log_data))

    return response


class ApiResponse:
    """
    Helper class for standardising API responses.
    
    Provides static methods to create consistent success and error responses.
    """
    @staticmethod
    def success(
        message: str, body: Optional[Any] = None, status_code: int = 200
    ) -> tuple[Any, int]:
        """
        Create a standardised success response.
        
        Parameters:
        ----------
        message : str
            Success message to return
        body : Optional[Any]
            Optional data to include in the response
        status_code : int
            HTTP status code (defaults to 200)
            
        Returns:
        -------
        tuple
            JSON response and status code
        """
        response = {
            "message": message,
        }
        if body is not None:
            response["body"] = body

        return jsonify(response), status_code

    @staticmethod
    def error(message: str, status_code: int = 400) -> tuple[Any, int]:
        """
        Create a standardised error response.
        
        Parameters:
        ----------
        message : str
            Error message to return
        status_code : int
            HTTP status code (defaults to 400)
            
        Returns:
        -------
        tuple
            JSON response and status code
        """
        return jsonify({"error": message}), status_code


def get_db():
    """
    Get a database connection from the Flask context or create a new one.
    
    Uses SQLite connection pooling via Flask's g object to efficiently
    reuse database connections.
    
    Returns:
    -------
    sqlite3.Connection
        Database connection object configured with Row factory
    """
    db = getattr(g, "_database", None)
    if db is None:
        db = g._database = sqlite3.connect(app.config["DATABASE"])
        db.row_factory = sqlite3.Row
    return db


@app.teardown_appcontext
def close_connection(exception=None):
    """
    Close the database connection when the application context ends.
    
    Parameters:
    ----------
    exception : Exception, optional
        The exception that caused the context to end, if any
    """
    db = getattr(g, "_database", None)
    if db is not None:
        db.close()


def generate_join_code(length=8):
    """
    Generate a random alphanumeric join code for workspaces.
    
    Via the secrets module.
    
    Parameters:
    ----------
    length : int, optional
        The length of the join code (defaults to 8)
        
    Returns:
    -------
    str
        A randomly generated alphanumeric join code
    """
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


def init_db():
    """
    Initialise the database and creates necessary tables if they don't exist.
    
    Creates tables for:
    - workplaces
    - users
    - security questions
    - tickets
    """
    db = get_db()
    db.execute(
        """CREATE TABLE IF NOT EXISTS workplaces
                  (id INTEGER PRIMARY KEY AUTOINCREMENT,
                   name TEXT NOT NULL,
                   description TEXT,
                   join_code TEXT UNIQUE,
                   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"""
    )

    db.execute(
        """CREATE TABLE IF NOT EXISTS users
                  (id INTEGER PRIMARY KEY AUTOINCREMENT,
                   name TEXT NOT NULL,
                   email TEXT UNIQUE NOT NULL,
                   password TEXT NOT NULL,
                   is_admin INTEGER DEFAULT 0,
                   workplace_id INTEGER,
                   mfa_enabled INTEGER DEFAULT 0,
                   FOREIGN KEY (workplace_id) REFERENCES workplaces (id))"""
    )

    db.execute(
        """CREATE TABLE IF NOT EXISTS security_questions
                  (id INTEGER PRIMARY KEY AUTOINCREMENT,
                   user_id INTEGER NOT NULL,
                   question TEXT NOT NULL,
                   answer TEXT NOT NULL,
                   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                   FOREIGN KEY (user_id) REFERENCES users (id))"""
    )

    db.execute(
        """CREATE TABLE IF NOT EXISTS tickets
                  (id INTEGER PRIMARY KEY AUTOINCREMENT,
                   title TEXT NOT NULL,
                   description TEXT NOT NULL,
                   status TEXT NOT NULL,
                   priority TEXT NOT NULL,
                   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                   owner_id INTEGER,
                   workplace_id INTEGER,
                   FOREIGN KEY (owner_id) REFERENCES users (id),
                   FOREIGN KEY (workplace_id) REFERENCES workplaces (id))"""
    )
    db.commit()


@app.route("/api/signup", methods=["POST"])
def signup():
    """
    Register a new user in the system.
    
    Expects a JSON payload with:
    - email: User's email address
    - password: User's password
    - name: User's display name (optional, defaults to email username)
    
    Returns:
    -------
    JSON response with user data and authentication cookies
    Status code 201 on success, 400/500 on failure
    """
    if not request.is_json:
        return ApiResponse.error("Request must be JSON format")
    
    data = request.json or {}
    email = data.get("email", "").strip()
    password = data.get("password", "")
    
    email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    if not email or not re.match(email_pattern, email):
        return ApiResponse.error("Please provide a valid email address")
        
    if not password or len(password) < 8:
        return ApiResponse.error("Password must be at least 8 characters long")
    
    name = data.get("name")
    if not name:
        try:
            name = email.split("@")[0]
        except (IndexError, AttributeError):
            name = ""

    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        return ApiResponse.error("Email already registered")

    try:
        hashed_password = generate_password_hash(password)

        cursor.execute(
            """
            INSERT INTO users (name, email, password, is_admin, workplace_id, mfa_enabled)
            VALUES (?, ?, ?, ?, ?, ?)
        """,
            (name, email, hashed_password, 0, None, 0),
        )
        user_id = cursor.lastrowid

        db.commit()

        access_token = create_access_token(identity=str(user_id))
        refresh_token = create_refresh_token(identity=str(user_id))

        user_data = {
            "id": user_id,
            "name": name,
            "email": email,
            "is_admin": False,
            "workplace_id": None,
            "mfa_enabled": False,
        }

        response = ApiResponse.success(
            message="User created successfully",
            body={"user": user_data},
            status_code=201,
        )[0]

        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)

        log_action("user_signup", {"user_id": user_id, "email": email})

        return response, 201

    except Exception as e:
        return ApiResponse.error(f"Failed to create user: {str(e)}", 500)


@app.route("/api/user/mfa/complete-auth", methods=["POST"])
def complete_mfa_auth():
    """
    Complete the MFA process.
    
    Called after MFA verification to finalise the authentication process
    by creating and setting authentication tokens.
    
    Expects JSON payload with:
    - email: User's email address
    
    Returns:
    -------
    JSON response with user data and authentication cookies
    Status code 200 on success, 404 on failure
    """
    data = request.json
    email = data.get("email")

    if not email:
        return ApiResponse.error("Email is required")

    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()

    if not user:
        return ApiResponse.error("User not found", 404)

    access_token = create_access_token(identity=str(user["id"]))
    refresh_token = create_refresh_token(identity=str(user["id"]))

    user_data = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "is_admin": bool(user["is_admin"]),
        "workplace_id": user["workplace_id"],
        "mfa_enabled": bool(user["mfa_enabled"]),
    }

    response = ApiResponse.success(
        message="Login successful", body={"user": user_data}
    )[0]

    set_access_cookies(response, access_token)
    set_refresh_cookies(response, refresh_token)

    log_action(
        "user_signin_mfa_complete", {"user_id": user["id"], "email": email}
    )

    return response, 200


@app.route("/api/user/check-credentials", methods=["POST"])
def check_credentials():
    """
    Validate user credentials without creating a session.
    
    Used for initial authentication check before MFA step.
    
    Expects JSON payload with:
    - email: User's email address
    - password: User's password
    
    Returns:
    -------
    JSON response indicating if credentials are valid
    Status code 200 on success, 401 on invalid credentials
    """
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return ApiResponse.error("Email and password are required")

    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()

    if not user:
        return ApiResponse.error("Invalid email or password", 401)

    if check_password_hash(user["password"], password):
        return ApiResponse.success("Credentials valid")

    return ApiResponse.error("Invalid email or password", 401)


@app.route("/api/user/mfa/check", methods=["POST"])
def check_mfa():
    """
    Check if MFA is enabled for a user and retrieve their security question.
    
    Expects JSON payload with:
    - email: User's email address
    
    Returns:
    -------
    JSON response with MFA status and security question if enabled
    Status code 200 on success, 404 if user not found
    """
    data = request.json
    email = data.get("email")

    if not email:
        return ApiResponse.error("Email is required")

    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "SELECT id, mfa_enabled FROM users WHERE email = ?", (email,)
    )
    user = cursor.fetchone()

    if not user:
        return ApiResponse.error("User not found", 404)

    if user["mfa_enabled"]:
        cursor.execute(
            "SELECT question FROM security_questions WHERE user_id = ?",
            (user["id"],),
        )
        security_question = cursor.fetchone()

        if not security_question:
            return ApiResponse.error("Security question not found", 404)

        return ApiResponse.success(
            "MFA status retrieved",
            {"mfaEnabled": True, "question": security_question["question"]},
        )

    return ApiResponse.success("MFA status retrieved", {"mfaEnabled": False})


@app.route("/api/signin", methods=["POST"])
def signin():
    """
    Authenticate a user and create a session.
    
    Handles standard authentication and respects MFA if enabled.
    
    Expects JSON payload with:
    - email: User's email address
    - password: User's password
    - mfa_verified: Boolean indicating if MFA was verified (optional)
    
    Returns:
    -------
    JSON response with user data and authentication cookies
    Status code 200 on success, 401 for invalid credentials, 403 if MFA required
    """
    data = request.json
    email = data.get("email")
    password = data.get("password")
    mfa_verified = data.get("mfa_verified", False)

    if not email or not password:
        return ApiResponse.error("Email and password are required")

    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()

    if not user:
        return ApiResponse.error("Invalid email or password", 401)

    if check_password_hash(user["password"], password):
        if user["mfa_enabled"] and not mfa_verified:
            return ApiResponse.error("MFA verification required", 403)

        access_token = create_access_token(identity=str(user["id"]))
        refresh_token = create_refresh_token(identity=str(user["id"]))

        user_data = {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "is_admin": bool(user["is_admin"]),
            "workplace_id": user["workplace_id"],
            "mfa_enabled": bool(user["mfa_enabled"]),
        }

        response = ApiResponse.success(
            message="Login successful", body={"user": user_data}
        )[0]

        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)

        log_action("user_signin", {"user_id": user["id"], "email": email})

        return response, 200

    return ApiResponse.error("Invalid email or password", 401)


@app.route("/api/user/mfa/verify", methods=["POST"])
def verify_mfa():
    """
    Verify a user's MFA security question answer.
    
    Expects JSON payload with:
    - email: User's email address
    - answer: User's answer to their security question
    
    Returns:
    -------
    JSON response with authentication cookies if verified
    Status code 200 on success, 401 for invalid answer, 404 if user not found
    """
    data = request.json
    email = data.get("email")
    answer = data.get("answer")

    if not email or not answer:
        return ApiResponse.error("Email and answer are required")

    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()

    if not user:
        return ApiResponse.error("User not found", 404)

    cursor.execute(
        "SELECT answer FROM security_questions WHERE user_id = ?",
        (user["id"],),
    )
    security_question = cursor.fetchone()

    if not security_question:
        return ApiResponse.error("Security question not found", 404)

    if check_password_hash(security_question["answer"], answer):
        access_token = create_access_token(
            identity=str(user["id"]), additional_claims={"mfa_verified": True}
        )
        refresh_token = create_refresh_token(identity=str(user["id"]))

        response = ApiResponse.success("MFA verification successful")[0]
        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)

        return response, 200
    return ApiResponse.error("Invalid answer", 401)


@app.route("/api/signout", methods=["POST"])
def signout():
    """
    End the user's session by clearing authentication cookies.
    
    Returns:
    -------
    JSON response confirming logout and cleared cookies
    Status code 200
    """
    response = ApiResponse.success("Logged out successfully")[0]
    unset_jwt_cookies(response)
    return response, 200


@app.route("/api/user/mfa/status", methods=["GET"])
@jwt_required()
def get_mfa_status():
    """
    Get the MFA status for the authenticated user.
    
    Returns:
    -------
    JSON response with MFA enabled status
    Status code 200 on success, 404 if user not found, 500 on error
    """
    try:
        current_user_id = get_jwt_identity()

        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            "SELECT mfa_enabled FROM users WHERE id = ?", (current_user_id,)
        )
        user = cursor.fetchone()

        if not user:
            return ApiResponse.error("User not found", 404)

        return ApiResponse.success(
            "MFA status retrieved", {"enabled": bool(user["mfa_enabled"])}
        )

    except Exception as e:
        return ApiResponse.error(
            f"Failed to retrieve MFA status: {str(e)}", 500
        )


@app.route("/api/user/mfa/setup", methods=["POST"])
@jwt_required()
def setup_mfa():
    """
    Set up Multi-Factor Authentication for the authenticated user.
    
    Creates or updates security question and answer for the user's MFA.
    Requires authentication via JWT.
    
    Expects JSON payload with:
    - question: Security question text
    - answer: Answer to the security question
    
    Returns:
    -------
    JSON response confirming MFA setup
    Status code 200 on success, 400 for missing data, 500 on error
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.json

        question = data.get("question")
        answer = data.get("answer")

        if not question or not answer:
            return ApiResponse.error("Question and answer are required")

        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            "SELECT mfa_enabled FROM users WHERE id = ?", (current_user_id,)
        )
        user = cursor.fetchone()

        if not user:
            return ApiResponse.error("User not found", 404)

        hashed_answer = generate_password_hash(answer)

        cursor.execute(
            "SELECT id FROM security_questions WHERE user_id = ?",
            (current_user_id,),
        )
        existing_question = cursor.fetchone()

        if existing_question:
            cursor.execute(
                """
                UPDATE security_questions
                SET question = ?, answer = ?
                WHERE user_id = ?
            """,
                (question, hashed_answer, current_user_id),
            )
        else:
            cursor.execute(
                """
                INSERT INTO security_questions (user_id, question, answer)
                VALUES (?, ?, ?)
            """,
                (current_user_id, question, hashed_answer),
            )

        cursor.execute(
            """
            UPDATE users
            SET mfa_enabled = 1
            WHERE id = ?
        """,
            (current_user_id,),
        )

        db.commit()

        log_action("mfa_setup", {"user_id": current_user_id})

        return ApiResponse.success("MFA setup successful")

    except Exception as e:
        return ApiResponse.error(f"Failed to setup MFA: {str(e)}", 500)


@app.route("/api/user/mfa/disable", methods=["POST"])
@jwt_required()
def disable_mfa():
    """
    Disable MFA for the authenticated user.
    
    Returns:
    -------
    JSON response confirming MFA disabled
    Status code 200 on success, 500 on error
    """
    try:
        current_user_id = get_jwt_identity()

        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            """
            UPDATE users
            SET mfa_enabled = 0
            WHERE id = ?
        """,
            (current_user_id,),
        )

        db.commit()

        log_action("mfa_disabled", {"user_id": current_user_id})

        return ApiResponse.success("MFA disabled successfully")

    except Exception as e:
        return ApiResponse.error(f"Failed to disable MFA: {str(e)}", 500)


@app.route("/api/user", methods=["PUT"])
@jwt_required()
def update_user():
    """
    Update the authenticated user's profile information.
    
    Expects JSON payload with:
    - name: User's display name (optional)
    - email: User's email address (optional)
    
    Returns:
    -------
    JSON response with updated user data
    Status code 200 on success, 400 for invalid data, 404 if user not found
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.json

        if not data:
            return ApiResponse.error("No data provided")

        allowed_fields = ["name", "email"]
        update_fields = {
            k: v
            for k, v in data.items()
            if k in allowed_fields and v is not None
        }

        if not update_fields:
            return ApiResponse.error("No valid fields to update")

        db = get_db()
        cursor = db.cursor()

        if "email" in update_fields:
            cursor.execute(
                "SELECT id FROM users WHERE email = ? AND id != ?",
                (update_fields["email"], current_user_id),
            )
            if cursor.fetchone():
                return ApiResponse.error("Email already exists", 400)

        query_parts = [f"{field} = ?" for field in update_fields.keys()]
        query = f"UPDATE users SET {', '.join(query_parts)} WHERE id = ?"
        params = list(update_fields.values()) + [current_user_id]

        cursor.execute(query, params)

        if cursor.rowcount == 0:
            return ApiResponse.error("User not found or no changes made", 404)

        db.commit()

        cursor.execute(
            """
            SELECT id, name, email, is_admin, workplace_id, mfa_enabled
            FROM users WHERE id = ?
        """,
            (current_user_id,),
        )
        user = cursor.fetchone()

        user_data = {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "is_admin": bool(user["is_admin"]),
            "workplace_id": user["workplace_id"],
            "mfa_enabled": bool(user["mfa_enabled"]),
        }

        return ApiResponse.success("User updated successfully", user_data)

    except Exception as e:
        return ApiResponse.error(f"Failed to update user: {str(e)}", 500)


@app.route("/api/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    """
    Refresh the access token using a valid refresh token.
    
    Returns:
    -------
    JSON response with new access token in cookies
    Status code 200 on success, 401 on failure
    """
    try:
        current_user_id = get_jwt_identity()
        access_token = create_access_token(identity=str(current_user_id))

        response = ApiResponse.success("Token refreshed successfully")[0]
        set_access_cookies(response, access_token)

        return response, 200
    except Exception as e:
        return ApiResponse.error("Token refresh failed", 401)


@app.route("/api/status", methods=["GET"])
@jwt_required()
def get_user():
    """
    Get the authenticated user's profile information.
    
    Returns:
    -------
    JSON response with user data
    Status code 200 on success, 404 if user not found, 500 on error
    """
    try:
        current_user_id = get_jwt_identity()

        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            """
            SELECT id, name, email, is_admin, workplace_id 
            FROM users WHERE id = ?
        """,
            (current_user_id,),
        )
        user = cursor.fetchone()

        if user:
            user_data = {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "is_admin": bool(user["is_admin"]),
                "workplace_id": user["workplace_id"],
            }
            return ApiResponse.success(
                "User retrieved successfully", user_data
            )

        return ApiResponse.error("User not found", 404)
    except Exception as e:
        return ApiResponse.error(f"Failed to retrieve user: {str(e)}", 500)


@app.route("/api/workspace", methods=["GET"])
@jwt_required()
def get_workspace_join_code():
    """
    Get the join code for the authenticated user's workspace.
    
    Returns:
    -------
    JSON response with workspace join code
    Status code 200 on success, 400 if no workspace, 403 if not admin
    """
    try:
        current_user_id = get_jwt_identity()

        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            "SELECT workplace_id, is_admin FROM users WHERE id = ?",
            (current_user_id,),
        )
        user = cursor.fetchone()

        if not user:
            return ApiResponse.error("User not found", 404)

        workplace_id = user["workplace_id"]

        if not workplace_id:
            return ApiResponse.error(
                "User does not belong to a workspace", 400
            )

        if not user["is_admin"]:
            return ApiResponse.error(
                "Only admins can access the join code", 403
            )

        cursor.execute(
            "SELECT join_code FROM workplaces WHERE id = ?", (workplace_id,)
        )
        workspace = cursor.fetchone()

        if not workspace:
            return ApiResponse.error("Workspace not found", 404)

        return ApiResponse.success(
            "Join code retrieved successfully",
            {"join_code": workspace["join_code"]},
        )

    except Exception as e:
        return ApiResponse.error(
            f"Failed to retrieve join code: {str(e)}", 500
        )


@app.route("/api/workspace/create", methods=["POST"])
@jwt_required()
def create_workspace():
    """
    Create a new workspace with the authenticated user as admin.
    
    Expects JSON payload with:
    - name: Workspace name
    - description: Workspace description (optional)
    
    Returns:
    -------
    JSON response with created workspace data
    Status code 201 on success, 400 if already in a workspace, 500 on error
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.json

        name = data.get("name")
        description = data.get("description", "")

        if not name:
            return ApiResponse.error("Workspace name is required")

        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            "SELECT workplace_id FROM users WHERE id = ?", (current_user_id,)
        )
        user = cursor.fetchone()

        if user and user["workplace_id"]:
            return ApiResponse.error(
                "User already belongs to a workspace", 400
            )

        join_code = generate_join_code()
        while True:
            cursor.execute(
                "SELECT id FROM workplaces WHERE join_code = ?", (join_code,)
            )
            if not cursor.fetchone():
                break
            join_code = generate_join_code()

        cursor.execute(
            """
            INSERT INTO workplaces (name, description, join_code)
            VALUES (?, ?, ?)
        """,
            (name, description, join_code),
        )
        workspace_id = cursor.lastrowid

        cursor.execute(
            """
            UPDATE users
            SET workplace_id = ?, is_admin = 1
            WHERE id = ?
        """,
            (workspace_id, current_user_id),
        )

        db.commit()

        cursor.execute(
            "SELECT * FROM workplaces WHERE id = ?", (workspace_id,)
        )
        workspace = cursor.fetchone()

        workspace_data = {
            "id": workspace["id"],
            "name": workspace["name"],
            "description": workspace["description"],
            "join_code": workspace["join_code"],
            "created_at": workspace["created_at"],
        }

        log_action(
            "workspace_created", {"workspace_id": workspace_id, "name": name}
        )

        return ApiResponse.success(
            "Workspace created successfully", workspace_data, 201
        )

    except Exception as e:
        return ApiResponse.error(f"Failed to create workspace: {str(e)}", 500)


@app.route("/api/workspace/join", methods=["POST"])
@jwt_required()
def join_workspace():
    """
    Join an existing workspace using a join code.
    
    Expects JSON payload with:
    - joinCode: Workspace join code
    
    Returns:
    -------
    JSON response with workspace data
    Status code 200 on success, 400 if already in a workspace, 404 for invalid code, 500 on error
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.json

        join_code = data.get("joinCode")

        if not join_code:
            return ApiResponse.error("Join code is required")

        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            "SELECT workplace_id FROM users WHERE id = ?", (current_user_id,)
        )
        user = cursor.fetchone()

        if user and user["workplace_id"]:
            return ApiResponse.error(
                "User already belongs to a workspace", 400
            )

        cursor.execute(
            "SELECT id FROM workplaces WHERE join_code = ?", (join_code,)
        )
        workspace = cursor.fetchone()

        if not workspace:
            return ApiResponse.error("Invalid join code", 404)

        cursor.execute(
            """
            UPDATE users
            SET workplace_id = ?, is_admin = 0
            WHERE id = ?
        """,
            (workspace["id"], current_user_id),
        )

        db.commit()

        cursor.execute(
            "SELECT * FROM workplaces WHERE id = ?", (workspace["id"],)
        )
        workspace = cursor.fetchone()

        workspace_data = {
            "id": workspace["id"],
            "name": workspace["name"],
            "description": workspace["description"],
            "created_at": workspace["created_at"],
        }

        return ApiResponse.success(
            "Joined workspace successfully", workspace_data
        )

    except Exception as e:
        return ApiResponse.error(f"Failed to join workspace: {str(e)}", 500)


@app.route("/api/workspace/users", methods=["GET"])
@jwt_required()
def get_workspace_users():
    """
    Get all users in the authenticated user's workspace.
    
    Returns:
    -------
    JSON response with array of user data including ID, name, email and admin status
    Status code 200 on success, 400 if no workspace, 500 on error
    """
    try:
        current_user_id = get_jwt_identity()

        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            "SELECT workplace_id FROM users WHERE id = ?", (current_user_id,)
        )
        user = cursor.fetchone()

        if not user or not user["workplace_id"]:
            return ApiResponse.error(
                "User does not belong to a workspace", 400
            )

        cursor.execute(
            """
            SELECT id, name, email, is_admin
            FROM users
            WHERE workplace_id = ?
        """,
            (user["workplace_id"],),
        )

        users = cursor.fetchall()
        users_data = [
            {
                "id": u["id"],
                "name": u["name"],
                "email": u["email"],
                "is_admin": bool(u["is_admin"]),
            }
            for u in users
        ]

        return ApiResponse.success("Users retrieved successfully", users_data)

    except Exception as e:
        return ApiResponse.error(f"Failed to retrieve users: {str(e)}", 500)


@app.route("/api/workspace/promote", methods=["POST"])
@jwt_required()
def promote_user():
    """
    Promote a user to admin in the workspace.
    
    Expects JSON payload with:
    - userId: ID of the user to promote
    
    Returns:
    -------
    JSON response confirming promotion
    Status code 200 on success, 400 if invalid request, 403 if not admin, 404 if user not found
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.json

        user_id = data.get("userId")

        if not user_id:
            return ApiResponse.error("User ID is required")

        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            "SELECT workplace_id, is_admin FROM users WHERE id = ?",
            (current_user_id,),
        )
        current_user = cursor.fetchone()

        if not current_user or not current_user["workplace_id"]:
            return ApiResponse.error(
                "User does not belong to a workspace", 400
            )

        if not current_user["is_admin"]:
            return ApiResponse.error("Only admins can promote users", 403)

        cursor.execute(
            "SELECT workplace_id FROM users WHERE id = ?", (user_id,)
        )
        target_user = cursor.fetchone()

        if not target_user:
            return ApiResponse.error("Target user not found", 404)

        if target_user["workplace_id"] != current_user["workplace_id"]:
            return ApiResponse.error(
                "Target user is not in the same workspace", 400
            )

        cursor.execute(
            """
            UPDATE users
            SET is_admin = 1
            WHERE id = ?
        """,
            (user_id,),
        )

        db.commit()

        return ApiResponse.success("User promoted to admin successfully")

    except Exception as e:
        return ApiResponse.error(f"Failed to promote user: {str(e)}", 500)


@app.route("/api/tickets", methods=["GET"])
@jwt_required()
def get_tickets():
    """
    Get tickets for the authenticated user's workspace.
    
    If user is an admin, returns all workspace tickets.
    Otherwise, returns only the user's own tickets.
    
    Returns:
    -------
    JSON response with array of ticket data
    Status code 200 on success, 400 if no workspace, 500 on error
    """
    try:
        current_user_id = get_jwt_identity()

        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            "SELECT workplace_id FROM users WHERE id = ?", (current_user_id,)
        )
        user = cursor.fetchone()

        if not user or not user["workplace_id"]:
            return ApiResponse.error(
                "User does not belong to a workspace", 400
            )

        cursor.execute(
            "SELECT is_admin FROM users WHERE id = ?", (current_user_id,)
        )
        user_role = cursor.fetchone()

        if user_role["is_admin"]:
            cursor.execute(
                """
            SELECT id, title, description, status, priority, created_at, owner_id
            FROM tickets
            WHERE workplace_id = ?
            ORDER BY created_at DESC
            """,
                (user["workplace_id"],),
            )
        else:
            cursor.execute(
                """
            SELECT id, title, description, status, priority, created_at, owner_id
            FROM tickets
            WHERE workplace_id = ? AND owner_id = ?
            ORDER BY created_at DESC
            """,
                (user["workplace_id"], current_user_id),
            )

        tickets = cursor.fetchall()
        tickets_data = [
            {
                "id": t["id"],
                "title": t["title"],
                "description": t["description"],
                "status": t["status"],
                "priority": t["priority"],
                "created_at": t["created_at"],
                "owner_id": t["owner_id"],
            }
            for t in tickets
        ]

        return ApiResponse.success(
            "Tickets retrieved successfully", tickets_data
        )

    except Exception as e:
        return ApiResponse.error(f"Failed to retrieve tickets: {str(e)}", 500)


@app.route("/api/tickets/create", methods=["POST"])
@jwt_required()
def create_ticket():
    """
    Create a new ticket in the user's workspace.
    
    Expects JSON payload with:
    - title: Ticket title
    - description: Ticket description
    - status: Ticket status (optional, defaults to "Open")
    - priority: Ticket priority (optional, defaults to "Medium")
    
    Returns:
    -------
    JSON response with created ticket data
    Status code 201 on success, 400 if invalid data or no workspace, 500 on error
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.json

        title = data.get("title")
        description = data.get("description")
        status = data.get("status", "Open")
        priority = data.get("priority", "Medium")

        if not title or not description:
            return ApiResponse.error("Title and description are required")

        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            "SELECT workplace_id FROM users WHERE id = ?", (current_user_id,)
        )
        user = cursor.fetchone()

        if not user or not user["workplace_id"]:
            return ApiResponse.error(
                "User does not belong to a workspace", 400
            )

        cursor.execute(
            """
            INSERT INTO tickets (title, description, status, priority, owner_id, workplace_id)
            VALUES (?, ?, ?, ?, ?, ?)
        """,
            (
                title,
                description,
                status,
                priority,
                current_user_id,
                user["workplace_id"],
            ),
        )

        ticket_id = cursor.lastrowid
        db.commit()

        cursor.execute("SELECT * FROM tickets WHERE id = ?", (ticket_id,))
        ticket = cursor.fetchone()

        ticket_data = {
            "id": ticket["id"],
            "title": ticket["title"],
            "description": ticket["description"],
            "status": ticket["status"],
            "priority": ticket["priority"],
            "created_at": ticket["created_at"],
            "owner_id": ticket["owner_id"],
        }

        return ApiResponse.success(
            "Ticket created successfully", ticket_data, 201
        )

    except Exception as e:
        return ApiResponse.error(f"Failed to create ticket: {str(e)}", 500)


@app.route("/api/tickets/<int:ticket_id>", methods=["PUT"])
@jwt_required()
def update_ticket(ticket_id):
    """
    Update an existing ticket.
    
    Admins can update any ticket in their workspace.
    Regular users can only update their own tickets.
    
    Parameters:
    ----------
    ticket_id : int
        The ID of the ticket to update
    
    Expects JSON payload with any of:
    - title: Ticket title
    - description: Ticket description
    - status: Ticket status ("Open", "In Progress", "Closed")
    - priority: Ticket priority ("Low", "Medium", "High")
    
    Returns:
    -------
    JSON response with updated ticket data
    Status code 200 on success, 403 if insufficient permissions, 404 if ticket not found
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.json

        if not data:
            return ApiResponse.error("No data provided")

        db = get_db()
        cursor = db.cursor()

        cursor.execute("SELECT * FROM tickets WHERE id = ?", (ticket_id,))
        ticket = cursor.fetchone()

        if not ticket:
            return ApiResponse.error("Ticket not found", 404)

        cursor.execute(
            "SELECT workplace_id, is_admin FROM users WHERE id = ?",
            (current_user_id,),
        )
        user = cursor.fetchone()

        if not user:
            return ApiResponse.error("User not found", 404)

        if ticket["workplace_id"] != user["workplace_id"]:
            return ApiResponse.error(
                "Ticket does not belong to your workspace", 403
            )

        if not user["is_admin"] and ticket["owner_id"] != int(current_user_id):
            return ApiResponse.error(
                "You don't have permission to update this ticket", 403
            )

        allowed_fields = ["title", "description", "status", "priority"]
        update_fields = {
            k: v
            for k, v in data.items()
            if k in allowed_fields and v is not None
        }

        if not update_fields:
            return ApiResponse.error("No valid fields to update")

        if "status" in update_fields and update_fields["status"] not in [
            "Open",
            "In Progress",
            "Closed",
        ]:
            return ApiResponse.error("Invalid status value")

        if "priority" in update_fields and update_fields["priority"] not in [
            "Low",
            "Medium",
            "High",
        ]:
            return ApiResponse.error("Invalid priority value")

        query_parts = [f"{field} = ?" for field in update_fields.keys()]
        query = f"UPDATE tickets SET {', '.join(query_parts)} WHERE id = ?"
        params = list(update_fields.values()) + [ticket_id]

        cursor.execute(query, params)
        db.commit()

        cursor.execute("SELECT * FROM tickets WHERE id = ?", (ticket_id,))
        updated_ticket = cursor.fetchone()

        ticket_data = {
            "id": updated_ticket["id"],
            "title": updated_ticket["title"],
            "description": updated_ticket["description"],
            "status": updated_ticket["status"],
            "priority": updated_ticket["priority"],
            "created_at": updated_ticket["created_at"],
            "owner_id": updated_ticket["owner_id"],
        }

        log_action(
            "ticket_updated",
            {"ticket_id": ticket_id, "updates": update_fields},
        )

        return ApiResponse.success("Ticket updated successfully", ticket_data)

    except Exception as e:
        return ApiResponse.error(f"Failed to update ticket: {str(e)}", 500)


with app.app_context():
    init_db()

if __name__ == "__main__":
    app.run()