import React, {useEffect, useState} from "react";
import {Button, Card, Form, Input, Switch, message} from "antd";
import authApi from "../../apis/auth";
import {withRouter, Redirect} from "react-router-dom";

const FORM_KEY = "nju.secondhand.form";
const TOKEN_KEY = "nju.secondhand.token";
const PATH_KEY = "path";

const authUtil = {};
authUtil.check = (): boolean => {
    return !!sessionStorage.getItem(TOKEN_KEY);
};
authUtil.pass = () => {
    sessionStorage.setItem(TOKEN_KEY, "token");
};

function Login(props) {
    // states
    const [form, setForm] = useState({username: "", password: "", remember: false});
    const [loading, setLoading] = useState(false);
    // methods
    const initForm = () => {
        const json = localStorage.getItem(FORM_KEY);
        json && setForm(JSON.parse(json));
    };
    const validForm = (form) => {
        return form.username && form.password;
    };
    // effect
    useEffect(() => {
        initForm();
    }, []);
    useEffect(() => {
        if (form.remember) {
            localStorage.setItem(FORM_KEY, JSON.stringify(form));
        } else {
            localStorage.removeItem(FORM_KEY);
        }
    }, [form]);

    // handler
    const handleLogin = async () => {
        try {
            setLoading(true);
            await authApi.login(form.username, form.password);
            authUtil.pass();
            const {location, history} = props;
            console.log(location);
            const params = new URLSearchParams(location.search);
            console.log(params);
            history.replace(params.get(PATH_KEY) || "/home");
        }catch (e) {
            message.error("登陆失败：" + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: "flex", width: "100vw", height: "90vh", flexDirection: "column",
            justifyContent: "center", alignItems: "center"
        }}>
            <Card>
                <Form>
                    <Form.Item label={"用户名"} required>
                        <Input
                            value={form.username}
                            onChange={event => setForm({...form, username: event.target.value})}
                        />
                    </Form.Item>
                    <Form.Item label={"密码"} required>
                        <Input
                            value={form.password}
                            onChange={event => setForm({...form, password: event.target.value})}
                            type="password"/>
                    </Form.Item>
                    <Form.Item style={{textAlign: "right"}}>
                            <Switch
                                checked={form.remember}
                                onChange={checked => setForm({...form, remember: checked})}
                                size="small" />
                            <span style={{marginLeft: "16px"}}>记住我</span>
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            style={{width: "100%"}}
                            loading={loading}
                            onClick={handleLogin}
                            disabled={!validForm(form)}
                        >
                            登陆
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

export function withAuth(WrappedComponent) {
    return function WithAuthComponent(props) {
        if (authUtil.check()) {
            return <WrappedComponent {...props}/>
        } else {
            const {location = {}} = props;
            const {pathname = "/home"} = location;
            return <Redirect to={{
                pathname: "/login",
                search: `?${PATH_KEY}=${pathname}`
            }} />
        }
    }
}

export default withRouter(Login);
export {authUtil};