import { create } from "zustand";

export const useAuthStore = create((set) => ({
    authUser: {name:"jhon",_id:123, age:25},
    isLoading: false,
    isLoggedIn: false,

    login: () => {
        console.log("login")
        set({ isLoggedIn: true, isLoading:true });
    },
}));