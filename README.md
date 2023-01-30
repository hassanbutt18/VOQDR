# VOQDR

VOQDR web application source code

## Overview

A specialized platform where one can
* Buy a tracker device
* Keep track of it on the map
* Share them with eachother to keep an eye on a network of devices.

## Instructions

* Install Python
* Install and Setup pip
* Clone repository
* Open command prompt in the repo folder
* Make Virtual Environment in the repo folder using
	`py -m venv your_venv_name`
	then
	`your_venv_name\Scripts\activate.bat`

* Navigate inside project folder
* Install all requirements using
	`pip install -r requirements.txt`

* Create .env file to store environment variables specific to your environment like
	* Django SECRET_KEY
	* Database variables, e.g. db engine, db name, db user, db host, db password db, port.
	* Email host, port, user, password
	* Base URL like http://localhost:8000/
	* STRIPE_SECRET_KEY, STRIPE_PUBLIC_KEY, STRIPE_ENDPOINT_SECRET

* Apply migrations using
	`py manage.py migrate`

* Start project using
	`py manage.py runserver`

* Open http://localhost:8000/ and verify