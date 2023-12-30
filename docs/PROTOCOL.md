# Protocol
This document covers the network protocol

## Network
| Key    	| Value 	    |
|--------	|-------	    |
| Method 	| Websockets   	|
| Port   	| 1895  	    |

## Structure
XedaDB uses a simple JSON-like protocol using MessagePack [#1](#links).
All packets sent, are lists (arrays).
The first item in the array (`data[0]`) is the action.
The second item (`data[1]`) is the packet ID. This is just a simple number that increments each time. This can be used for ordering packets.
The third item (`data[2]`) is a list of all arguments.

## Packets
There are multiple packettypes:
| STATE    	| Used for         	        |
|--------	|-------	                |
| PRE 	    | Authentication   	        |
| DATA   	| Querying data             |
| POST   	| Finishing the connection  |
| ALL   	| Applies to every state    |
### ALL
#### `STATE`
| KEY    	| VALUE         	        |
|--------	|-------	                |
| PacketID 	| `STATE`           	    |
| Mode   	| toClient                  |
| State   	| `ALL`                     |
This packet is sent when the state of the clients changes.


## Links
MessagePack:
https://msgpack.org/