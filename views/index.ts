/**
import HomeView from "./homeView";
import OnboardingView from "./auth/onboardingView";
import ProfileView from "./profileView";
import SettingsView from "./settingsView";
import MyStoriesView from "./myStoriesView";
import PenView from "./penView";
import NewStoryView from "./pen/newStoryView";
import LibraryView from "./libraryView";
import NewLibraryView from "./newLibraryView";
import StoryPreviewView from "./storyPreviewView";
import EditStoryView from "./pen/editStoryView";
import PremiumView from "./premiumView";
import NotificationView from "./notificationView";
import TestView from "./testView";
 */
// Auth Views
import AuthLayoutView from "./auth/authLayoutView";
import SignupView from "./auth/signupView";
import LoginView from "./auth/loginView";
import OtpView from "./auth/otpView";
import ForgotPasswordView from "./auth/forgotPasswordView";
import SetupView from "./auth/setupView";
import EmailSentView from "./auth/emailSentView";
import UpdatePasswordView from "./auth/updatePasswordView";
import PasswordUpdatedView from "./auth/passwordUpdatedView";
/*
export * from "./auth";
export * from "./app";
export * from "./profile";
import StoryPreviewView from "./storyPreviewView";
*/
export {
  AuthLayoutView,
  SignupView,
  LoginView,
  OtpView,
  ForgotPasswordView,
  SetupView,
  EmailSentView,
  UpdatePasswordView,
  PasswordUpdatedView,
  /**  StoryPreviewView,

 
  HomeView,
  OnboardingView,
  ProfileView,
  SettingsView,
  MyStoriesView,
  PenView,
  NewStoryView,
  LibraryView,
  NewLibraryView,
  EditStoryView,
  PremiumView,
  NotificationView,
  
  
  TestView, */
};
