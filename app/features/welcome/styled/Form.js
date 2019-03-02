// Flow

import styled from 'styled-components';

export default styled.form`
    width: 300px;
    label, span{
      font-size: 13px;
      color: #424242;
      font-weight: bold;
    }
    .form-group{
      width: 100%;
      margin: 0 auto;
    }
    input{
      width: 100%;
      height: 24px;
      font-size: 15px;
      padding: 4px 8px;

    }
    select{
      width: 18em;
      height: 40px;
      font-size: 15px;
      padding: 4px 8px;
      width: 100%;
      border:1px solid #d1efe6;

    }
    .error{
      font-size: 15px;
      background-color: #ff2a2a;
      padding:5px;
      text-align:center;
      margin-top: 10px;
      color: #fff;
    }
`;
