import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile 
} from "firebase/auth";
import { getDatabase, ref, push, onChildAdded } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyAmdzmJa23bpeVdBBxnzbLHBtiuu5gGBAI",
    authDomain: "mydatabase100-d45ff.firebaseapp.com",
    databaseURL: "https://mydatabase100-d45ff-default-rtdb.firebaseio.com",
    projectId: "mydatabase100-d45ff",
    storageBucket: "mydatabase100-d45ff.apphost.com",
    messagingSenderId: "995667612707",
    appId: "1:995667612707:web:6843132a481e76808a4d96",
    measurementId: "G-TNXWZ6F3CW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const messagesRef = ref(database, 'messages');

// DOM Elements
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const messagesContainer = document.getElementById('messages');
const authContainer = document.getElementById('auth-container');
const chatContainer = document.getElementById('chat-container');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');

// Auth Form Toggle
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');
const loginForm = document.querySelector('#login-form');
const signupForm = document.querySelector('#signup-form');
const authToggleTexts = document.querySelectorAll('#auth-toggle p');

showSignupLink.addEventListener('click', () => {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    authToggleTexts[0].style.display = 'none';
    authToggleTexts[1].style.display = 'block';
});

showLoginLink.addEventListener('click', () => {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    authToggleTexts[0].style.display = 'block';
    authToggleTexts[1].style.display = 'none';
});

let currentUser = null;

// Login
loginBtn.addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    signInWithEmailAndPassword(auth, email, password)
        .catch(error => {
            console.error("Login error", error);
            alert(error.message);
        });
});

// Signup
signupBtn.addEventListener('click', () => {
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Update profile with username
            return updateProfile(userCredential.user, {
                displayName: username
            });
        })
        .catch(error => {
            console.error("Signup error", error);
            alert(error.message);
        });
});

// Logout
logoutBtn.addEventListener('click', () => {
    signOut(auth)
        .catch(error => console.error("Logout error", error));
});

// Auth State Observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        authContainer.querySelector('#login-section').style.display = 'none';
        authContainer.querySelector('#user-profile').style.display = 'block';
        chatContainer.style.display = 'block';
        
        userName.textContent = user.displayName || user.email;
    } else {
        currentUser = null;
        authContainer.querySelector('#login-section').style.display = 'block';
        authContainer.querySelector('#user-profile').style.display = 'none';
        chatContainer.style.display = 'none';
    }
});

// Messaging
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText && currentUser) {
        push(messagesRef, {
            text: messageText,
            sender: currentUser.uid,
            senderName: currentUser.displayName || currentUser.email,
            timestamp: Date.now()
        });
        messageInput.value = '';
    }
}

onChildAdded(messagesRef, (snapshot) => {
    const message = snapshot.val();
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(message.sender === currentUser?.uid ? 'sent' : 'received');
    messageElement.innerHTML = `
        <strong>${message.senderName}</strong>
        <p>${message.text}</p>
    `;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
});