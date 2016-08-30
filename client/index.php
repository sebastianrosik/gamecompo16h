<?php
setcookie("ws", "192.168.2.198:8086");
session_name("jetpack");
session_start();

require_once("index.html");
