# Protocol
This document covers the network protocol

## Network
| Method 	| TCP  	|
|--------	|------	|
| Port   	| 1895 	|

## Structure
XedaDB uses a simple JSON-like protocol using MessagePack [#1](#links).
All packets sent, are lists (arrays).
The first item in the array (`data[0]`) is the action.
The second item (`data[1]`) is a list of all arguments.

## Links
MessagePack:
https://msgpack.org/