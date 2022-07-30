import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import React, {useCallback, useEffect, useState} from 'react'
import {DateTime} from 'luxon'

import './app.css'
import axios from 'axios';
import jwtDecode from 'jwt-decode'
import { Snackbar, Typography } from '@mui/material';

type Props = {

}

const App: React.FC<Props> = () => {
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [isLogged, setIsLogged] = useState<boolean>(false)
    const [token, setToken] = useState<string>('')
    const [prescription, setPrescription] = useState<string>('')
    const [isSnack, setIsSnack] = useState<boolean>(false)
    const [snackMessage, setSnackMessage] = useState<string>('')

    useEffect(() => {
        setLoading(true)
        const jwt = sessionStorage.getItem('token')
        if (jwt) {
            const decoded: any = jwtDecode(jwt)
            const now = DateTime.now()
            const exp = DateTime.fromSeconds(decoded.exp)
            if (exp > now) {
                setIsLogged(true)
                setToken(jwt)
            }
        }
        setLoading(false)
    }, [])

    const onAbortSnack = useCallback(() => {
        setIsSnack(false)
    }, [])


    const onSubmit = useCallback((e: React.SyntheticEvent) => {
        e.preventDefault()
        setLoading(true)
        axios({
            method: 'POST',
            url: 'http://51.178.48.126:3000/auth/login',
            data: {
                email,
                password
            }
        })
        .then((res) => {
            sessionStorage.setItem('token', res.data.access_token)
            setSnackMessage('Connexion établie')
            setIsLogged(true)
            setEmail('')
            setPassword('')
            setToken(res.data.access_token)
        })
        .finally(() =>  {
            setLoading(false)
        })

    }, [email, password])

    const onAddPrescription = useCallback((e: React.SyntheticEvent) => {
        e.preventDefault()
        if (prescription.length > 0) {
            setLoading(true)
            axios({
                method: 'POST',
                url: 'http://51.178.48.126:3000/prescription',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    label: prescription
                }
            })
            .then(() => {
                setPrescription('')
                setIsSnack(true)
                setSnackMessage('Prescription ajoutée')
            })
            .catch((e) => {
                if (e.response?.status === 401) {
                    setToken('')
                    setIsLogged(false)
                }
            })
            .finally(() => {
                setLoading(false)
            })
        }
    }, [prescription, token])
    return (
    <div className='app'>
        {loading ? (
            <div>
                loading
            </div>
        ) : (
            <>
                {!isLogged ? (

                    <Box>
                        <form className="app-login-box" onSubmit={onSubmit}>
                            <div>
                                <TextField
                                    value={email}
                                    label="Email"
                                    variant="outlined"
                                    onChange={(e) => {
                                        setEmail(e.target.value)
                                    }}
                                />
                            </div>
                            <div>
                                <TextField
                                    value={password}
                                    type="password"
                                    label="Mot de passe"
                                    variant="outlined"
                                    onChange={(e) => {
                                        setPassword(e.target.value)
                                    }}
                                />
                            </div>
                            <Button variant="contained" type="submit">Connexion</Button>
                        </form>
                    </Box>
                ) : (
                    <form className='app-main-box' onSubmit={onAddPrescription}>
                        <div className='app-main-box-title'>
                            <Typography variant="h4" component="h2">
                                Ajouter une ordonance
                            </Typography>
                        </div>
                        <TextField
                            multiline
                            minRows={5}
                            fullWidth
                            variant="outlined"
                            value={prescription}
                            label="Prescription"
                            onChange={(e) => {
                                setPrescription(e.target.value)
                            }}
                        />
                        <Button variant="contained" type="submit">Ajouter</Button>
                    </form>
                )}
            </>
        )}
        <Snackbar
            open={isSnack}
            autoHideDuration={2000}
            onAbort={onAbortSnack}
            message={snackMessage}
        />
    </div>
)}

export default App