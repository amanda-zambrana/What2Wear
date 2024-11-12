import { Stack } from "expo-router";

const Authlayout = () => {
    return(
        <Stack>
            <Stack.Screen name="SigninforWhat2Wear" options={{ headerShown:false}} /> 
            <Stack.Screen name= "SignupforWhat2Wear" options= {{headerShown:false}} />
            {/* <Stack.Screen name="+not-found" /> */}

        </Stack>
    );
};
export default Authlayout;