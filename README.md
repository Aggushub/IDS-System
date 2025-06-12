# 🛡️ Honeypot-Based Intrusion Detection System

A Machine Learning-powered Intrusion Detection System that leverages the Cowrie honeypot to log and analyze attacker behavior in a controlled environment. Built on Debian with VMware virtualization and MongoDB storage, this project uses the AdaBoost algorithm to detect anomalies and suspicious patterns in cyberattack data.

---

## 📌 Project Overview

This IDS project is designed to monitor, log, and analyze malicious activity in a simulated network environment. By deploying **Cowrie**, a medium-interaction SSH and Telnet honeypot, we collect real-world attack data. The data is stored in **MongoDB**, preprocessed, and then classified using the **AdaBoost** algorithm to distinguish between benign and malicious behavior.

---

## 🔧 Tech Stack

- **Virtualization:** VMware Workstation
- **Operating System:** Debian (Honeypot hosted)
- **Honeypot:** Cowrie
- **Database:** MongoDB
- **Programming Languages:** Python, Bash
- **Machine Learning:** AdaBoost (Scikit-learn)
- **Visualization:** Matplotlib, Seaborn, Pandas

---

## 📂 Project Structure

IDS-System

│<br>
├── interceptor-ids-master  #Zip file containing all the files <br> 
└── README.md                # Project documentation


## ⚙️ Setup Instructions

### 1. Deploy Honeypot

* Install and configure Cowrie on a Debian VM using VMware.
* Ensure logging to MongoDB is correctly set.

### 2. Set Up MongoDB

```bash
sudo service mongod start
mongo
```

### 3. Extract and Preprocess Logs

* Use Python scripts to pull data from MongoDB and preprocess it for training.

### 4. Train ML Model

```bash
python train_adaboost.py
```

### 5. Evaluate Results

* Check classification report and confusion matrix.
* Visualize the model’s detection capability using provided plots.

---

## 📊 Features

* ✅ Real-time data capture from honeypot
* ✅ Automated log extraction and parsing
* ✅ ML-based anomaly detection
* ✅ Detailed analytics and visualization
* ✅ Scalable and modular architecture

---

## 🚀 Sample Output

* **Classification Accuracy:** \~94%
* **Features Used:** Command frequency, session duration, IP repetition, input entropy
* **Model Used:** AdaBoost with decision stumps

---

## 🧠 Learning Outcomes

* Hands-on experience in cybersecurity and network defense
* Understanding of honeypots and attacker behavior
* Applied machine learning for real-world threat detection
* System integration using multiple technologies

---

## 📬 Contact

Have questions or want to collaborate?<br> 
📧 Email: [joel.amosphilip@example.com](mailto:joel.amosphilip@example.com)

🔗 LinkedIn: [linkedin.com/in/aghu-a570b9227](https://www.linkedin.com/in/aghu-a570b9227)
