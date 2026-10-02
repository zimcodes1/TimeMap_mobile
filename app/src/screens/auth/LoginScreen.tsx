import React, { useState } from "react";
import {
	View,
	StyleSheet,
	Image,
	Pressable,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
} from "react-native";
import { Control } from "react-hook-form";
import {
	Lock,
	Eye,
	EyeOff,
	GraduationCap,
	Briefcase,
	ArrowLeft,
} from "lucide-react-native";
import { colors } from "@/theme/colors";
import { Text } from "@/components/common/Text";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { LoginSchema } from "@/lib/validation/auth";

export type LoginRoleTab = "staff" | "student";

export interface LoginScreenProps {
	onSubmit: () => void;
	isLoading: boolean;
	control: Control<LoginSchema>;
	activeTab: LoginRoleTab;
	onTabChange: (tab: LoginRoleTab) => void;
	onNavigateToForgotPassword: () => void;
	onNavigateToRegister: () => void;
	onNavigateBack?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
	onSubmit,
	isLoading,
	control,
	activeTab,
	onTabChange,
	onNavigateToForgotPassword,
	onNavigateToRegister,
	onNavigateBack,
}) => {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<KeyboardAvoidingView
			style={styles.keyboardContainer}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
		>
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled"
				automaticallyAdjustKeyboardInsets={true}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.container}>
					{/* Top Back Navigation if handler provided */}
					{onNavigateBack && (
						<Pressable
							style={styles.backButton}
							onPress={onNavigateBack}
							hitSlop={12}
						>
							<ArrowLeft size={20} color={colors.textMain} />
							<Text style={styles.backText}>Back</Text>
						</Pressable>
					)}

					{/* Top Brand Logo & App Name */}
					<View style={styles.brandRow}>
						<Image
							source={require("../../../assets/images/logo.png")}
							style={styles.logo}
							resizeMode="contain"
						/>
						<Text style={styles.brandName}>NSUK TimeMap</Text>
					</View>

					{/* Header */}
					<View style={styles.header}>
						<Text style={styles.title}>Welcome back</Text>
						<Text style={styles.subtitle}>
							{activeTab === "student"
								? "Sign in to access your student timetable"
								: "Sign in to your staff management account"}
						</Text>
					</View>

					{/* Tab Selector */}
					<View style={styles.tabContainer}>
						<Pressable
							style={[
								styles.tabButton,
								activeTab === "student" && styles.activeTabButton,
							]}
							onPress={() => onTabChange("student")}
						>
							<GraduationCap
								size={17}
								color={
									activeTab === "student"
										? colors.primaryForeground
										: colors.textMuted
								}
								style={styles.tabIcon}
							/>
							<Text
								style={[
									styles.tabText,
									activeTab === "student" && styles.activeTabText,
								]}
							>
								Student Login
							</Text>
						</Pressable>

						<Pressable
							style={[
								styles.tabButton,
								activeTab === "staff" && styles.activeTabButton,
							]}
							onPress={() => onTabChange("staff")}
						>
							<Briefcase
								size={16}
								color={
									activeTab === "staff"
										? colors.primaryForeground
										: colors.textMuted
								}
								style={styles.tabIcon}
							/>
							<Text
								style={[
									styles.tabText,
									activeTab === "staff" && styles.activeTabText,
								]}
							>
								Staff Login
							</Text>
						</Pressable>
					</View>

					{/* Form Fields */}
					<View style={styles.form}>
						<FormField<LoginSchema>
							name="id"
							control={control}
							render={({ value, onChange, onBlur, error }) => (
								<Input
									label={activeTab === "student" ? "Matric Number" : "Staff ID"}
									placeholder={
										activeTab === "student"
											? "e.g. FT24DAT0001"
											: "e.g. STAFF0002"
									}
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									error={error}
									leftIcon={
										activeTab === "student" ? (
											<GraduationCap size={18} color={colors.textSubtle} />
										) : (
											<Briefcase size={18} color={colors.textSubtle} />
										)
									}
									autoCapitalize={
										activeTab === "student" ? "characters" : "none"
									}
								/>
							)}
						/>

						<FormField<LoginSchema>
							name="password"
							control={control}
							render={({ value, onChange, onBlur, error }) => (
								<Input
									label="Password"
									placeholder="••••••••"
									secureTextEntry={!showPassword}
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									error={error}
									leftIcon={<Lock size={18} color={colors.textSubtle} />}
									rightIcon={
										<Pressable
											onPress={() => setShowPassword((prev) => !prev)}
											hitSlop={8}
										>
											{showPassword ? (
												<EyeOff size={18} color={colors.textMuted} />
											) : (
												<Eye size={18} color={colors.textMuted} />
											)}
										</Pressable>
									}
									autoCapitalize="none"
								/>
							)}
						/>

						{/* Forgot Password Link */}
						<View style={styles.forgotRow}>
							<Pressable onPress={onNavigateToForgotPassword} hitSlop={8}>
								<Text style={styles.forgotText}>Forgot password?</Text>
							</Pressable>
						</View>

						{/* Submit Button */}
						<View style={styles.submitContainer}>
							<Button
								variant="primary"
								size="lg"
								isLoading={isLoading}
								onPress={onSubmit}
							>
								Sign in
							</Button>
						</View>
					</View>

					{/* Footer */}
					<View style={styles.footer}>
						{activeTab === "student" ? (
							<View style={styles.footerRow}>
								<Text style={styles.footerText}>Don't have an account? </Text>
								<Pressable onPress={onNavigateToRegister} hitSlop={8}>
									<Text style={styles.contactText}>Create account</Text>
								</Pressable>
							</View>
						) : (
							<Text style={styles.footerText}>
								Don't have an account?{" "}
								<Text style={styles.contactText}>
									Contact your administrator
								</Text>
							</Text>
						)}
					</View>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	keyboardContainer: {
		flex: 1,
		backgroundColor: colors.background,
	},
	scrollContent: {
		flexGrow: 1,
		paddingHorizontal: 24,
		paddingTop: 24,
		paddingBottom: 140,
	},
	container: {
		width: "100%",
		maxWidth: 400,
		alignSelf: "center",
	},
	backButton: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 20,
		paddingVertical: 6,
		alignSelf: "flex-start",
	},
	backText: {
		fontSize: 14,
		fontWeight: "500",
		color: colors.textMain,
		marginLeft: 8,
	},
	brandRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 28,
	},
	logo: {
		width: 28,
		height: 28,
		marginRight: 10,
	},
	brandName: {
		fontSize: 15,
		fontWeight: "600",
		color: colors.textMain,
	},
	header: {
		marginBottom: 20,
	},
	title: {
		fontSize: 26,
		fontWeight: "700",
		color: colors.textMain,
		marginBottom: 4,
	},
	subtitle: {
		fontSize: 15,
		color: colors.textMuted,
	},
	tabContainer: {
		flexDirection: "row",
		backgroundColor: colors.surface,
		borderRadius: 12,
		padding: 4,
		marginBottom: 24,
		borderWidth: 1,
		borderColor: colors.border,
	},
	tabButton: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 10,
		borderRadius: 8,
	},
	activeTabButton: {
		backgroundColor: colors.primary,
	},
	tabIcon: {
		marginRight: 6,
	},
	tabText: {
		fontSize: 14,
		fontWeight: "600",
		color: colors.textMuted,
	},
	activeTabText: {
		color: colors.primaryForeground,
		fontWeight: "700",
	},
	form: {
		marginBottom: 24,
	},
	forgotRow: {
		alignItems: "flex-end",
		marginTop: 6,
		marginBottom: 20,
	},
	forgotText: {
		fontSize: 13,
		fontWeight: "600",
		color: colors.primary,
	},
	submitContainer: {
		marginTop: 4,
	},
	footer: {
		alignItems: "center",
		marginTop: 16,
	},
	footerRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	footerText: {
		fontSize: 13,
		color: colors.textMuted,
		textAlign: "center",
	},
	contactText: {
		color: colors.primary,
		fontWeight: "600",
	},
});
