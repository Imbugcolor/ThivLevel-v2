import React, { useState, useEffect, useRef, useContext } from "react";
import {
	PayPalScriptProvider,
	PayPalHostedFieldsProvider,
	PayPalHostedField,
	usePayPalHostedFields,
} from "@paypal/react-paypal-js";
import axios from "axios";
import { GlobalState } from "../../../GlobalState";
import LoadingLayout from "../utils/loading/LoadingLayout";
import { CLIENT_URL } from "../utils/config";
import Swal from 'sweetalert2'

const CUSTOM_FIELD_STYLE = {"border":"1px solid #606060",};
const INVALID_COLOR = {
	color: "#dc3545",
};

// Example of custom component to handle form submit
const SubmitPayment = ({ cardHolderName  }) => {
	const [paying, setPaying] = useState(false);
	const hostedField = usePayPalHostedFields();
  const [isTransaction, setIsTransaction] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null);

  const state = useContext(GlobalState)
  const [socket] = state.userAPI.socket

  useEffect(() => {
    socket.on('ORDER_SUCCESS', () =>{
        setIsTransaction(false)
        Swal.fire({
          width: 500,
          icon: 'success',
          title: `<span class='title-msg-dialog'>Đặt hàng thành công.</span>`,
          showConfirmButton: true,
          timer: 3000
        })
        window.location.href = `${CLIENT_URL}/cart`;
    })

    return () => socket.off('ORDER_SUCCESS')
  }, [socket]);

  useEffect(() => {
    socket.on('ORDER_FAILED', (error) =>{
        setIsTransaction(false)
        Swal.fire({
          width: 500,
          icon: 'error',
          title: `<span class='title-msg-dialog'>Thanh toán thất bại.</span>`,
          text: error.msg,
          showConfirmButton: true,
          timer: 3000
        })
    })

    return () => socket.off('ORDER_FAILED')
  }, [socket]);

  async function onApproveCallback(data, actions) {
      try {
        const response = await fetch(`/api/orders/${data.orderID}/capture`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
    
        const orderData = await response.json();
    
        // Three cases to handle:
        //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
        //   (2) Other non-recoverable errors -> Show a failure message
        //   (3) Successful transaction -> Show confirmation or thank you message
    
        const transaction =
          orderData?.purchase_units?.[0]?.payments?.captures?.[0] ||
          orderData?.purchase_units?.[0]?.payments?.authorizations?.[0];
        const errorDetail = orderData?.details?.[0];
    
        // this actions.restart() behavior only applies to the Buttons component
        if (errorDetail?.issue === "INSTRUMENT_DECLINED" && !data.card && actions) {
          // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
          // recoverable state, per https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
          return actions.restart();
        } else if (
          errorDetail ||
          !transaction ||
          transaction.status === "DECLINED"
        ) {
          // (2) Other non-recoverable errors -> Show a failure message
          let errorMessage;
          if (transaction) {
            errorMessage = `Transaction ${transaction.status}: ${transaction.id}`;
          } else if (errorDetail) {
            errorMessage = `${errorDetail.description} (${orderData.debug_id})`;
          } else {
            errorMessage = JSON.stringify(orderData);
          }
    
          throw new Error(errorMessage);
        } else {
          // (3) Successful transaction -> Show confirmation or thank you message
          // Or go to another URL:  actions.redirect('thank_you.html');
          console.log(
            "Capture result",
            orderData,
            JSON.stringify(orderData, null, 2),
          );
        }
        setPaying(false)
        setIsTransaction(true)
      } catch (error) {
        setErrorMessage(error)
        console.error(error);
      }
  }

	const handleClick = () => {
		if (!hostedField?.cardFields) {
            const childErrorMessage = 'Unable to find any child components in the <PayPalHostedFieldsProvider />';
            throw new Error(childErrorMessage);
        }
		const isFormInvalid =
			Object.values(hostedField.cardFields.getState().fields).some(
				(field) => !field.isValid
			) || !cardHolderName?.current?.value;

		if (isFormInvalid) {
			return setErrorMessage(
				"Thông tin thanh toán không hợp lệ."
			);
		}
		setPaying(true);
		hostedField.cardFields
			.submit({
				cardholderName: cardHolderName?.current?.value,
			})
			.then((data) => {
				return onApproveCallback(data)
			})
			.catch((err) => {
				// Here handle error
        console.log(err)
        setErrorMessage(err.message)
				setPaying(false);
			});
	};

	return (
		<>
			  <button
				className={`${paying ? "" : " btn-primary"}`}
				style={{
          width: '100%',
          background: '#000',
          height: '40px',
          color: '#fff',
          borderRadius: '5px',
          opacity: paying ? '0.4' : '1',
          margin: '15px 0'
        }}
        disabled={paying}
				onClick={handleClick}
			  >
				{ paying ? <div className="paypal-checkout-button"><svg
          aria-hidden="true"
          role="status"
          className="loading-paypal-checkout animate-spin"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="#E5E7EB"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentColor"
          />
        </svg>  Loading...</div> : "Thanh toán"}
			  </button>

        <div>
          {
            errorMessage && <p style={{ fontSize: '15px', color: 'red' }}>{errorMessage}</p>
          }
        </div>

        { isTransaction && <LoadingLayout />}
		</>
	);
};

function Paypal({ name, phone, address }) {
    const state = useContext(GlobalState)
    const [user] = state.userAPI.user
    const [token] = state.token
    const [socket] = state.userAPI.socket
	  const [clientToken, setClientToken] = useState(null);
    const [clientId, setClientId] = useState(null)
    const cardHolderName = useRef(null);

	useEffect(() => {
		(async () => {
			const response = await axios.get('/api/paypal/generate-token', {
                headers: { Authorization: token }
            })
			setClientToken(response.data.clientToken);
      setClientId(response.data.clientId)
		})();
	}, []);


    async function createOrderCallback() {
        try {
          const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            // use the "body" param to optionally pass additional order information
            // like product ids and quantities
            body: JSON.stringify({
              data: {
                socketId: socket.id,
                user_id: user._id,
                address,
                phone,
                name
              }
            }),
          });
      
          const orderData = await response.json();
      
          if (orderData.id) {
            return orderData.id;
          } else {
            const errorDetail = orderData?.details?.[0];
            const errorMessage = errorDetail
              ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
              : JSON.stringify(orderData);
      
            throw new Error(errorMessage);
          }
        } catch (error) {
          Swal.fire({
            width: 500,
            icon: 'error',
            title: `<span class='title-msg-dialog'>Thanh toán thất bại.</span>`,
            text: error,
            showConfirmButton: true,
            timer: 3000
          })
          console.error(error);
        }
    }

	return (
		<>
			{clientToken && clientId ? (
        <div>
				<PayPalScriptProvider
					options={{
						"client-id": clientId,
						components: "buttons,hosted-fields",
						"data-client-token": clientToken,
					}}
				>
					<PayPalHostedFieldsProvider
						styles={{".valid":{"color":"#28a745"},".invalid":{"color":"#dc3545"},"input":{"font-family":"monospace","font-size":"16px"}}}
						createOrder={createOrderCallback}
					>
                        <label htmlFor="card-number">
                            Số thẻ
                            <span style={INVALID_COLOR}>*</span>
                        </label>
                        <PayPalHostedField
                            id="card-number"
                            className="card-field"
                            style={CUSTOM_FIELD_STYLE}
                            hostedFieldType="number"
                            options={{
                                selector: "#card-number",
                                placeholder: "1234 5678 9012 3456",
                            }}
                        />
                        <label title="This represents the full name as shown in the card">
                            Tên trên thẻ
                        <input
                          id="card-holder"
                          ref={cardHolderName}
                          className="card-field"
                          style={{ "border":"1px solid #606060", outline: "none" }}
                          type="text"
                          placeholder="NGUYEN VAN A"
                        />
                        </label>
                        <div className="cvv_expiration-date_section">
                          <div>
                            <label htmlFor="cvv">
                                CVV<span style={INVALID_COLOR}>*</span>
                            </label>
                            <PayPalHostedField
                                id="cvv"
                                className="card-field"
                                style={CUSTOM_FIELD_STYLE}
                                hostedFieldType="cvv"
                                options={{
                                    selector: "#cvv",
                                    placeholder: "123",
                                    maskInput: true,
                                }}
                            />
                          </div>
                          <div>
                            <label htmlFor="expiration-date">
                                Ngày hết hạn
                                <span style={INVALID_COLOR}>*</span>
                            </label>
                            <PayPalHostedField
                                id="expiration-date"
                                className="card-field"
                                style={CUSTOM_FIELD_STYLE}
                                hostedFieldType="expirationDate"
                                options={{
                                    selector: "#expiration-date",
                                    placeholder: "MM/YYYY",
                                }}
                            />
                          </div>
                        </div>
						<SubmitPayment cardHolderName={cardHolderName}/>
					</PayPalHostedFieldsProvider>
				</PayPalScriptProvider>
        </div>
			) : (
        <div className="paypal_loading">
        <svg
          aria-hidden="true"
          role="status"
          className="loader animate-spin"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="#E5E7EB"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentColor"
          />
        </svg>
      </div>
			)}
		</>
	);
}

export default Paypal