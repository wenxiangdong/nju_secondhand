import {Icon, Input} from "antd";
import React from "react";
import debounce from "../../utils/debounce";

export default function InputWithDebounce({debounceDuration = 500, onChange} = {}) {
    const searchIcon = (
        <Icon type={"search"}/>
    );

    const handleChange = debounce({
        fn: (e) => {
            onChange && onChange(e);
        }
    });


    return (
        <Input
            suffix={searchIcon}
            onChange={e => {
                e.persist();
                handleChange(e);
            }}/>
    );
}