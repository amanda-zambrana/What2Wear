import { Stack } from "expo-router";

const Authlayout = () => {
    return(
        <Stack>
            <Stack.Screen name="signup" options={{ headerShown:false}} /> 
            <Stack.Screen name= "signin" options= {{headerShown:false}} />
            <Stack.Screen name="+not-found" />

        </Stack>
    );
};
export default Authlayout;