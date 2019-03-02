// @flow
import * as $ from 'jquery';
import Button from '@atlaskit/button';
import { FieldTextStateless } from '@atlaskit/field-text';
import { SpotlightTarget } from '@atlaskit/onboarding';
import Page from '@atlaskit/page';
import { AtlasKitThemeProvider } from '@atlaskit/theme';
import Select from '@atlaskit/select';
import React, { Component } from 'react';
import type { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Navbar } from '../../navbar';
import { Onboarding, startOnboarding } from '../../onboarding';
import { RecentList } from '../../recent-list';
import { normalizeServerURL } from '../../utils';

import { Body, Form, Header, Wrapper, BrandSection, Label } from '../styled';
import * as moment from 'moment-timezone';
import { NONAME } from 'dns';



type Props = {

    /**
     * Redux dispatch.
     */
    dispatch: Dispatch<*>;

    /**
     * React Router location object.
     */
    location: Object;
};

type State = {

    /**
     * URL of the room to join.
     * If this is not a url it will be treated as room name for default domain.
     */
    url: string;
    username: string;
    password: string;
    timezones: string;
    webcams: string;
    microphones: string;
    speakers:string;
    roomName:string;
    shown:boolean;
};
/**
 * Updates the timezone dropdown from the Moment.Js timezone library
 */
function getTimezones()
{
	// Add each timezone to the dropdown
	let timezones = moment.tz.names();
	for( let timezone of timezones )
	{
		var timeZoneDropDown = $( '#timezones' )[0];
		var option = document.createElement( "option" );
        option.text = timezone;
        timeZoneDropDown.appendChild( option )
		//timeZoneDropDown.appendChild( option );
	}
}
/**
 * Gets the available media devices and adds an option to the appropiate dropdown
 * i.e. Webcams, Microphones or Speakers
 */
function getMediaDevices()
{
	navigator.mediaDevices.enumerateDevices().then( ( devices ) =>
	{

		for( let device of devices )
		{
			var dropdown;
			var dropdownText = "";
			if( device.kind.toString() == "videoinput" )
			{
				dropdown = $( '#webcams' )[0];

				// For webcams, some extra info is added in brackets to the webcam name,
				// we need to remove this
				if( device.label.indexOf( '(' ) > -1 )
				{
					dropdownText = device.label.substr( 0, device.label.indexOf( '(' ) );
				}
				else
				{
					dropdownText = device.label;
				}
			}
			else if( device.kind.toString() == "audioinput" )
			{
				dropdown = $( '#microphones' )[0];
				dropdownText = device.label;
			}
			else if( device.kind.toString() == "audiooutput" )
			{
				dropdown = $( '#speakers' )[0];
				dropdownText = device.label;
			}

			var option = document.createElement( "option" );
            option.id = device.deviceId;
            option.value = device.deviceId;
			option.text = dropdownText;
			dropdown.appendChild( option );
		}
	} );
}

/**
 * Welcome Component.
 */
class Welcome extends Component<Props, State> {
    /**
     * Initializes a new {@code Welcome} instance.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        // Initialize url value in state if passed using location state object.
        let url = '';
        let username = '';
        let password = '';
        let country = '';
        let timezones = '';
        let webcam = '';
        let microphones = '';
        let speakers = '';
        let shown = false;

        // Check and parse url if exists in location state.
        if (props.location.state) {
            const { room, serverURL } = props.location.state;

            if (room && serverURL) {
                url = `${serverURL}/${room}`;
            }
        }

        this.state = { url , username , password , country , timezones ,webcam , microphones , speakers , shown};

        // Bind event handlers.
        this._onURLChange = this._onURLChange.bind(this);
        this.username = this.username.bind(this);
        this.password = this.password.bind(this);
        this.country = this.country.bind(this);
        this.timezones = this.timezones.bind(this);
        this.webcams = this.webcams.bind(this);
        this.microphones = this.microphones.bind(this);
        this.speakers = this.speakers.bind(this);
        this._onFormSubmit = this._onFormSubmit.bind(this);
        this._onJoin = this._onJoin.bind(this);

    }

    /**
     * Start Onboarding once component is mounted.
     *
     * NOTE: It autonatically checks if the onboarding is shown or not.
     *
     * @returns {void}
     */
    componentDidMount() {
       // this.props.dispatch(startOnboarding('welcome-page'));
        getTimezones();
        getMediaDevices();

    }

    componentWillMount()
    {
        ///alert('s0');


    }

    /**
     * Render function of component.
     *
     * @returns {ReactElement}
     */
    render() {
        return (
            // <Page navigation = { <Navbar /> }>
            <Page>
                <AtlasKitThemeProvider mode = 'light'>
                    <Wrapper>
                        { this._renderHeader() }
                      { /*this._renderBody()*/ }
                        <Onboarding section = 'welcome-page' />
                    </Wrapper>
                </AtlasKitThemeProvider>
            </Page>
        );
    }

    _onFormSubmit: (*) => void;

    /**
     * Prevents submission of the form and delegates the join logic.
     *
     * @param {Event} event - Event by which this function is called.
     * @returns {void}
     */
    _onFormSubmit(event: Event) {
        event.preventDefault();
        this._onJoin();
    }

    _onJoin: (*) => void;


    /**
     * Redirect and join conference.
     *
     * @returns {void}
     */
    _onJoin() {
        const inputURL = this.state.url;
        const inputusername = this.state.username;
        const inputpassword = this.state.password;
        const inputcountry = this.state.country;
        const inputtimezonesL = this.state.timezones;
        const inputwebcam = this.state.webcams;
        const inputmicrophones = this.state.microphones;
        const inputspeakers = this.state.speakers;
        const lastIndexOfSlash = inputURL.lastIndexOf('/');
        let room;
        let serverURL;
        let roomName;
        let authenticate = 0;
        let name;
        let timeZoneVar;
        let DisplayName;
        let country;
        let DATAA;
        
        $( '.connection-error' ).addClass( 'hidden' );

		// If online then connect to the conference...

		if( navigator.onLine )
		{
			var information = {
				'videouser': inputusername, // $( '#roomName' ).val()
				'videopassword': inputpassword,
				'from': '020202',
				'body': '010101'
			};

			//Ajax call to authenticate user
			$.ajax({
				type: "GET",
				url: "https://development.ubiety.me/videowindow/api/vwv1.php",
				dataType: "xml",
				data: information,
				async: false,
				contentType: "text/xml; charset=\"utf-8\"",
				complete: function (xmlResponse) {

					// So you can see what was wrong...
					//console.log(xmlResponse);
                    //console.log(xmlResponse.responseText);
                        if(xmlResponse.responseText=='ERROR: Invalid user'){
                            authenticate = 0;
                        } else {
                        var xmlDoc = xmlResponse.responseXML;

                        var x = xmlDoc.getElementsByTagName("login");

                        if (x[0].getElementsByTagName("status")[0].innerHTML == 'authenticated'){
                            //alert(x[0].getElementsByTagName("status")[0].innerHTML + "All good");
                            roomName = x[0].getElementsByTagName("roomName")[0].innerHTML;
                            timeZoneVar = x[0].getElementsByTagName("timezone")[0].innerHTML;
                            DisplayName = x[0].getElementsByTagName("DisplayName")[0].innerHTML;
                            country = x[0].getElementsByTagName("country")[0].innerHTML;
                            DATAA = x[0].getElementsByTagName("DATAA")[0].innerHTML;

                            authenticate = 1;
                            //alert(roomName);
                        
                        }else{
                            // If the credentials are not OK alert user
                            authenticate = 0;
                           // alert("Error: Please try again");
                        
                            return;
                        }
                    }
				}
            });
       }else
       {
           // An error occurred so show the connection error and scroll to the top
           alert("Connection Error: Please try again");
       }
      //roomName = 'test';

        if(authenticate == 1) {
            this.setState({
                shown: false
            });
         if (lastIndexOfSlash === -1) {
                // This must be only the room name.
                room = roomName;
            } else {
                // Take the substring after last slash to be the room name.
                room = roomName;

                // Take the substring before last slash to be the Server URL.
                serverURL = inputURL.substring(0, lastIndexOfSlash);

                // Normalize the server URL.
                serverURL = normalizeServerURL(serverURL);
            }

            // Don't navigate if no room was specified.
            if (!room) {
                return;
            }
        //    var aestTime = new Date().toLocaleString("en-US", {timeZone: timeZoneVar});
             //aestTime = new Date(aestTime);
             //aestTime = moment(aestTime).format('LT');
             //var a = moment.tz(aestTime, timeZoneVar);
             //timeZoneVar =  'Asia/Tokyo';
             this.props.dispatch(push('/conference', {
                room,
                serverURL,
                name:DisplayName + '-de-' + country + '-de-' + timeZoneVar + '-de-' + DATAA 
            }));
        } else {
            //alert();
            this.setState({
                shown: true
            });
        }
    }

    _onURLChange: (*) => void;
    username: (*) => void;
    password: (*) => void;
    country: (*) => void;
    timezones: (*) => void;
    webcams: (*) => void;
    microphones: (*) => void;
    speakers: (*) => void;

    /**
     * Keeps URL input value and URL in state in sync.
     *
     * @param {SyntheticInputEvent<HTMLInputElement>} event - Event by which
     * this function is called.
     * @returns {void}
     */
    _onURLChange(event: SyntheticInputEvent<HTMLInputElement>) {
        //console.log(event);
        this.setState({
            url: event.currentTarget.value
        });
    }
    username(event: SyntheticInputEvent<HTMLInputElement>) {
        //console.log(event);
        this.setState({
            username: event.currentTarget.value
        });
    }

    password(event: SyntheticInputEvent<HTMLInputElement>) {
        this.setState({
            password: event.currentTarget.value
        });
    }

    timezones(event: SyntheticInputEvent<HTMLInputElement>) {
        this.setState({
            timezones: event.currentTarget.value
        });
    }

    country(event: SyntheticInputEvent<HTMLInputElement>) {
        this.setState({
            country: event.currentTarget.value
        });
    }

    webcams(event: SyntheticInputEvent<HTMLInputElement>) {
        //console.log(event.currentTarget);
        this.setState({
            webcams: event.currentTarget.value
        });
    }
    microphones(event: SyntheticInputEvent<HTMLInputElement>) {
        //console.log(event.currentTarget.value);
        this.setState({
            microphones: event.currentTarget.value
        });
    }
    speakers(event: SyntheticInputEvent<HTMLInputElement>) {
        this.setState({
            speakers: event.currentTarget.value
        });
    }


    /**
     * Renders the body for the welcome page.
     *
     * @returns {ReactElement}
     */
    _renderBody() {
        return (
            <Body>
                <RecentList />
            </Body>
        );
    }

    /**
     * Renders the header for the welcome page.
     *
     * @returns {ReactElement}
     */
    _renderHeader() {
        const locationState = this.props.location.state;
        const locationError = locationState && locationState.error;
        var shown = {
			display: this.state.shown ? "block" : "none"
		};

		// var hidden = {
		// 	display: this.state.shown ? "none" : "block"
		// }
        return (
          <React.Fragment>
            <Header>
            <BrandSection>
             <h1>Video Window</h1>
            </BrandSection>
            <SpotlightTarget name = 'conference-url'>
                    <Form onSubmit = { this._onFormSubmit }>
                    <div>
                      <FieldTextStateless
                          type = 'text'
                          label = 'Username'
                          placeholder = 'Enter your Username'
                          shouldFitContainer = { true }
                          value = { this.state.username }
                          onChange = { this.username }
                          />
                      <FieldTextStateless
                          type = 'Password'
                          label = 'Password'
                          placeholder = 'Enter Password'
                          shouldFitContainer = { true }
                          value = { this.state.password }
                          onChange = { this.password }
                          />
                         <div style={{display:'none'}}>
                            <FieldTextStateless
                                
                                isInvalid = { locationError }
                                onChange = { this._onURLChange }
                                placeholder = 'Enter the Room Name'
                                shouldFitContainer = { true }
                                type = 'text'
                                value = { this.state.url }
                                label = 'Room Name'
                                />
                        </div>
                      <div style={{display:'none'}}>
                        <FieldTextStateless
                            autoFocus = { true }
                            value = { this.state.country }
                            onChange = { this.country }
                            placeholder = 'Enter a name for your Country'
                            shouldFitContainer = { true }
                            type = 'text'

                            label = 'Country'
                            />
                        <Label>Select Timezone</Label>
                        <select id="timezones"   value = { this.state.timezones }
                            onChange = { this.timezones } className="single-select"  label="Select Timezone"  placeholder="Select Timezone">
                          <option value=''>Select</option>
                        </select>
                        </div>
                        <Label>Select Webcam</Label>
                        {/* <Select
                                id="webcams"
                                className="single-select"
                                classNamePrefix="react-select"
                                label="Select Webcam"
                                options={[
                                  { label: 'easy', value: 'Easy Cam' },
                                  { label: 'easy2', value: 'Easy Cam 2' }
                                ]}
                                placeholder="Select Webcam"
                        /> */}
                        <select id="webcams" value = { this.state.webcams }
                            onChange = { this.webcams } className="single-select"  label="Select Webcam"  placeholder="Select Webcam"> <option value=''>Select</option></select>

                        <Label>Select Microphone</Label>
                        {/* <Select
                                id="microphones"
                                className="single-select"
                                classNamePrefix="react-select"
                                label="Select Webcam"
                                options={[
                                  { label: 'easy', value: 'Microphone' },
                                  { label: 'easy2', value: 'Microphone 2' }
                                ]}
                                placeholder="Select Microphone"
                        /> */}
                         <select id="microphones"  value = { this.state.microphones }
                            onChange = { this.microphones }  className="single-select"

                                label="Select Webcam"   placeholder="Select Microphone">
                                <option value=''>Select</option>
                           </select>


                        <Label>Select Speker</Label>
                        {/* <Select
                                id="speakers"
                                className="single-select"
                                classNamePrefix="react-select"
                                label="Select Webcam"
                                options={[
                                  { label: 'easy', value: 'Speker' },
                                  { label: 'easy2', value: 'Speker 2' }
                                ]}
                                placeholder="Select Speker"
                        /> */}
                        <select
                                id="speakers"
                                className="single-select"
                                value = { this.state.speakers }
                                onChange = { this.speakers }
                                label="Select Webcam"
                                placeholder="Select Speker"
                        >  <option value=''>Select</option></select>
                        <div>
				<h2 className="error" style={ shown }>ERROR: Invalid user</h2>
				{/* <h2 style={ hidden }>this.state.shown = false</h2> */}

			</div>
                    </div>
                    </Form>
                </SpotlightTarget>
                <Button
                    appearance = 'primary'
                    onClick = { this._onJoin }
                    type = 'button'>
                    CONNECT
                </Button>
            </Header>
          </React.Fragment>
        );
    }
}

export default connect()(Welcome);
