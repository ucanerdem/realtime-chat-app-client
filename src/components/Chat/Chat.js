import React, { useState, useEffect } from "react"
import queryString from "query-string"
import io from "socket.io-client"

import InfoBar from "../InfoBar/InfoBar"
import Messages from "../Messages/Messages"
import Input from "../Input/Input"
import TextContainer from "../TextContainer/TextContainer"

import "./Chat.css"

import { Redirect } from 'react-router-dom';

let socket

const Chat = ({ location }) => {
    const [name, setName] = useState("")
    const [room, setRoom] = useState("")
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState([])
    const [users, setUsers] = useState('')

    const ENDPOINT = "https://realtime-chat-app-server.herokuapp.com/"  //"localhost:5000"

    const [toHome, setToHome] = useState(false)

    useEffect(() => {
        const { name, room } = queryString.parse(location.search)

        socket = io(ENDPOINT)

        setName(name)
        setRoom(room)

        socket.emit("join", { name, room }, (error) => {
            if (error) {
                alert(error)
                //how to navigate to home page
                setToHome(true)
            }
        })
    }, [ENDPOINT, location.search])


    useEffect(() => {
        socket.on("message", (message) => {
            setMessages([...messages, message])
        })

        socket.on("roomData", ({ users }) => {
            setUsers(users)
        })

        return () => {
            socket.emit("disconnect")

            socket.off()
        }
    }, [messages])

    const sendMessage = (event) => {
        event.preventDefault()

        if (message) {
            socket.emit("sendMessage", message, () => setMessage(""))
        }
    }

    return (
        toHome ?
            <Redirect to="/" />
            :
            (
                <div className="outerContainer">
                    <div className="container">
                        <InfoBar room={room} />
                        <Messages messages={messages} name={name} />
                        <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
                    </div>
                    <TextContainer users={users} />
                </div>
            )
    )
}

export default Chat