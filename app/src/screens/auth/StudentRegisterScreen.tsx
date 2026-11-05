import React, { useState, useMemo } from "react";
import {
	View,
	StyleSheet,
	Pressable,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	ActivityIndicator,
} from "react-native";
import { Control, FieldErrors } from "react-hook-form";
import {
	ArrowLeft,
	User,
	GraduationCap,
	Mail,
	Lock,
	Eye,
	EyeOff,
	Building2,
	BookOpen,
	ChevronDown,
	AlertCircle,
	RefreshCw,
} from "lucide-react-native";
import { colors } from "@/theme/colors";
import { Text } from "@/components/common/Text";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { StudentRegisterSchema } from "@/lib/validation/auth";
import {
	HierarchyOption,
	DepartmentOption,
	ProgramOption,
} from "@/api/authAPI";
import {
	SelectOptionBottomSheet,
	SelectOptionItem,
} from "@/components/bottom-sheets/SelectOptionBottomSheet";

export interface StudentRegisterScreenProps {
	control: Control<StudentRegisterSchema>;
	errors: FieldErrors<StudentRegisterSchema>;
	isLoading: boolean;
	isFetchingOptions: boolean;
	isOptionsError?: boolean;
	optionsErrorMessage?: string;
	onRetryFetchOptions?: () => void;
	faculties: HierarchyOption[];
	departments: DepartmentOption[];
	programs: ProgramOption[];
	selectedFacultyId?: number;
	selectedDepartmentId?: number;
	selectedProgramId?: number;
	selectedLevel?: number;
	onSelectFaculty: (facultyId: number) => void;
	onSelectDepartment: (departmentId: number) => void;
	onSelectProgram: (programId: number) => void;
	onSelectLevel: (level: number) => void;
	onSubmit: () => void;
	onNavigateBack: () => void;
}

export const StudentRegisterScreen: React.FC<StudentRegisterScreenProps> = ({
	control,
	errors,
	isLoading,
	isFetchingOptions,
	isOptionsError,
	optionsErrorMessage,
	onRetryFetchOptions,
	faculties,
	departments,
	programs,
	selectedFacultyId,
	selectedDepartmentId,
	selectedProgramId,
	selectedLevel,
	onSelectFaculty,
	onSelectDepartment,
	onSelectProgram,
	onSelectLevel,
	onSubmit,
	onNavigateBack,
}) => {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// BottomSheet visibility states
	const [facultySheetVisible, setFacultySheetVisible] = useState(false);
	const [deptSheetVisible, setDeptSheetVisible] = useState(false);
	const [progSheetVisible, setProgSheetVisible] = useState(false);

	// Filtered lists
	const availableDepartments = useMemo(() => {
		if (!selectedFacultyId) return [];
		return departments.filter((d) => d.faculty_id === selectedFacultyId);
	}, [departments, selectedFacultyId]);

	const availablePrograms = useMemo(() => {
		if (!selectedDepartmentId) return [];
		return programs.filter((p) => p.department_id === selectedDepartmentId);
	}, [programs, selectedDepartmentId]);

	// Selected program details
	const selectedProgram = useMemo(() => {
		return programs.find((p) => p.id === selectedProgramId);
	}, [programs, selectedProgramId]);

	// Available levels derived from selected program's max_level
	const availableLevels = useMemo(() => {
		if (!selectedProgram) return [];
		const maxLvl = selectedProgram.max_level || 400;
		const lvls: number[] = [];
		for (let lvl = 100; lvl <= maxLvl; lvl += 100) {
			lvls.push(lvl);
		}
		return lvls;
	}, [selectedProgram]);

	// Names of selected entities for display
	const selectedFaculty = faculties.find((f) => f.id === selectedFacultyId);
	const selectedDept = departments.find((d) => d.id === selectedDepartmentId);

	// Format options for SelectOptionBottomSheet
	const facultyItems: SelectOptionItem[] = useMemo(
		() => faculties.map((f) => ({ id: f.id, label: f.name, sublabel: f.code })),
		[faculties],
	);

	const deptItems: SelectOptionItem[] = useMemo(
		() =>
			availableDepartments.map((d) => ({
				id: d.id,
				label: d.name,
				sublabel: d.code,
			})),
		[availableDepartments],
	);

	const progItems: SelectOptionItem[] = useMemo(
		() =>
			availablePrograms.map((p) => ({
				id: p.id,
				label: p.name,
				sublabel: `${p.code} • Up to ${p.max_level}L`,
			})),
		[availablePrograms],
	);

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
					{/* Top Back Navigation & Title */}
					<Pressable
						style={styles.backButton}
						onPress={onNavigateBack}
						hitSlop={12}
					>
						<ArrowLeft size={20} color={colors.textMain} />
						<Text style={styles.backText}>Back to login</Text>
					</Pressable>

					<View style={styles.header}>
						<Text style={styles.title}>Create Student Account</Text>
						<Text style={styles.subtitle}>
							Sign up with your matric number and program details to access your
							lecture schedules.
						</Text>
					</View>

					{isFetchingOptions ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator size="large" color={colors.primary} />
							<Text style={styles.loadingText}>
								Loading faculty & department options...
							</Text>
						</View>
					) : isOptionsError && faculties.length === 0 ? (
						<View style={styles.errorContainer}>
							<AlertCircle size={32} color={colors.danger} />
							<Text style={styles.errorTitle}>
								Unable to Load Academic Options
							</Text>
							<Text style={styles.errorSubtitle}>
								{optionsErrorMessage ||
									"Could not connect to the backend server. Please verify your network."}
							</Text>
							{onRetryFetchOptions && (
								<Pressable
									style={styles.retryButton}
									onPress={onRetryFetchOptions}
								>
									<RefreshCw
										size={16}
										color={colors.primaryForeground}
										style={styles.retryIcon}
									/>
									<Text style={styles.retryText}>Retry Connection</Text>
								</Pressable>
							)}
						</View>
					) : (
						<View style={styles.form}>
							{/* Section: Personal Info */}
							<Text style={styles.sectionHeader}>Personal Information</Text>

							<FormField<StudentRegisterSchema>
								name="fullName"
								control={control}
								render={({ value, onChange, onBlur, error }) => (
									<Input
										label="Full Name"
										placeholder="e.g. John Doe"
										value={value}
										onChangeText={onChange}
										onBlur={onBlur}
										error={error}
										leftIcon={<User size={18} color={colors.textSubtle} />}
										autoCapitalize="words"
									/>
								)}
							/>

							<FormField<StudentRegisterSchema>
								name="matricNumber"
								control={control}
								render={({ value, onChange, onBlur, error }) => (
									<Input
										label="Matric Number"
										placeholder="e.g. FT24SLT0002"
										value={value}
										onChangeText={onChange}
										onBlur={onBlur}
										error={error}
										leftIcon={
											<GraduationCap size={18} color={colors.textSubtle} />
										}
										autoCapitalize="characters"
									/>
								)}
							/>

							<FormField<StudentRegisterSchema>
								name="email"
								control={control}
								render={({ value, onChange, onBlur, error }) => (
									<Input
										label="Email Address"
										placeholder="e.g. student@nsuk.edu.ng"
										value={value}
										onChangeText={onChange}
										onBlur={onBlur}
										error={error}
										leftIcon={<Mail size={18} color={colors.textSubtle} />}
										keyboardType="email-address"
										autoCapitalize="none"
									/>
								)}
							/>

							{/* Section: Academic Details */}
							<Text style={styles.sectionHeader}>Academic Details</Text>

							{/* Faculty Selector */}
							<View style={styles.selectorWrapper}>
								<Text style={styles.selectorLabel}>Faculty</Text>
								<Pressable
									style={[
										styles.selectorButton,
										Boolean(errors.facultyId) && styles.selectorButtonError,
									]}
									onPress={() => setFacultySheetVisible(true)}
								>
									<View style={styles.selectorLeft}>
										<Building2
											size={18}
											color={colors.textSubtle}
											style={styles.selectorIcon}
										/>
										<Text
											style={[
												styles.selectorValue,
												!selectedFaculty && styles.selectorPlaceholder,
											]}
											numberOfLines={1}
										>
											{selectedFaculty
												? selectedFaculty.name
												: "Select Faculty"}
										</Text>
									</View>
									<ChevronDown size={18} color={colors.textMuted} />
								</Pressable>
								{errors.facultyId?.message ? (
									<Text style={styles.fieldErrorText}>
										{errors.facultyId.message}
									</Text>
								) : null}
							</View>

							{/* Department Selector */}
							<View style={styles.selectorWrapper}>
								<Text style={styles.selectorLabel}>Department</Text>
								<Pressable
									style={[
										styles.selectorButton,
										!selectedFacultyId && styles.selectorButtonDisabled,
										Boolean(errors.departmentId) && styles.selectorButtonError,
									]}
									onPress={() => {
										if (selectedFacultyId) setDeptSheetVisible(true);
									}}
									disabled={!selectedFacultyId}
								>
									<View style={styles.selectorLeft}>
										<Building2
											size={18}
											color={colors.textSubtle}
											style={styles.selectorIcon}
										/>
										<Text
											style={[
												styles.selectorValue,
												!selectedDept && styles.selectorPlaceholder,
											]}
											numberOfLines={1}
										>
											{!selectedFacultyId
												? "Select Faculty first"
												: selectedDept
													? selectedDept.name
													: "Select Department"}
										</Text>
									</View>
									<ChevronDown size={18} color={colors.textMuted} />
								</Pressable>
								{errors.departmentId?.message ? (
									<Text style={styles.fieldErrorText}>
										{errors.departmentId.message}
									</Text>
								) : null}
							</View>

							{/* Program Selector */}
							<View style={styles.selectorWrapper}>
								<Text style={styles.selectorLabel}>Program</Text>
								<Pressable
									style={[
										styles.selectorButton,
										!selectedDepartmentId && styles.selectorButtonDisabled,
										Boolean(errors.programId) && styles.selectorButtonError,
									]}
									onPress={() => {
										if (selectedDepartmentId) setProgSheetVisible(true);
									}}
									disabled={!selectedDepartmentId}
								>
									<View style={styles.selectorLeft}>
										<BookOpen
											size={18}
											color={colors.textSubtle}
											style={styles.selectorIcon}
										/>
										<Text
											style={[
												styles.selectorValue,
												!selectedProgram && styles.selectorPlaceholder,
											]}
											numberOfLines={1}
										>
											{!selectedDepartmentId
												? "Select Department first"
												: selectedProgram
													? selectedProgram.name
													: "Select Program"}
										</Text>
									</View>
									<ChevronDown size={18} color={colors.textMuted} />
								</Pressable>
								{errors.programId?.message ? (
									<Text style={styles.fieldErrorText}>
										{errors.programId.message}
									</Text>
								) : null}
							</View>

							{/* Level Selector (Chips) */}
							<View style={styles.selectorWrapper}>
								<Text style={styles.selectorLabel}>
									Level{" "}
									{selectedProgram ? `(Max ${selectedProgram.max_level}L)` : ""}
								</Text>
								{!selectedProgram ? (
									<Text style={styles.helperText}>
										Select a program above to choose your level
									</Text>
								) : (
									<View style={styles.levelChipsContainer}>
										{availableLevels.map((lvl) => {
											const isSelected = selectedLevel === lvl;
											return (
												<Pressable
													key={lvl}
													style={[
														styles.levelChip,
														isSelected && styles.selectedLevelChip,
													]}
													onPress={() => onSelectLevel(lvl)}
												>
													<Text
														style={[
															styles.levelChipText,
															isSelected && styles.selectedLevelChipText,
														]}
													>
														{lvl}L
													</Text>
												</Pressable>
											);
										})}
									</View>
								)}
								{errors.level?.message ? (
									<Text style={styles.fieldErrorText}>
										{errors.level.message}
									</Text>
								) : null}
							</View>

							{/* Section: Security */}
							<Text style={styles.sectionHeader}>Security</Text>

							<FormField<StudentRegisterSchema>
								name="password"
								control={control}
								render={({ value, onChange, onBlur, error }) => (
									<Input
										label="Password"
										placeholder="At least 6 characters"
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

							<FormField<StudentRegisterSchema>
								name="confirmPassword"
								control={control}
								render={({ value, onChange, onBlur, error }) => (
									<Input
										label="Confirm Password"
										placeholder="Re-enter password"
										secureTextEntry={!showConfirmPassword}
										value={value}
										onChangeText={onChange}
										onBlur={onBlur}
										error={error}
										leftIcon={<Lock size={18} color={colors.textSubtle} />}
										rightIcon={
											<Pressable
												onPress={() => setShowConfirmPassword((prev) => !prev)}
												hitSlop={8}
											>
												{showConfirmPassword ? (
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

							{/* Submit Button */}
							<View style={styles.submitContainer}>
								<Button
									variant="primary"
									size="lg"
									isLoading={isLoading}
									onPress={onSubmit}
								>
									Create Account
								</Button>
							</View>
						</View>
					)}

					{/* Footer */}
					<View style={styles.footer}>
						<Text style={styles.footerText}>Already have an account? </Text>
						<Pressable onPress={onNavigateBack} hitSlop={8}>
							<Text style={styles.signInLink}>Sign in</Text>
						</Pressable>
					</View>
				</View>
			</ScrollView>

			{/* Hierarchy Selector Bottom Sheets */}
			<SelectOptionBottomSheet
				visible={facultySheetVisible}
				onClose={() => setFacultySheetVisible(false)}
				title="Select Faculty"
				subtitle="Choose your university faculty"
				items={facultyItems}
				selectedId={selectedFacultyId}
				onSelect={(item) => onSelectFaculty(item.id)}
			/>

			<SelectOptionBottomSheet
				visible={deptSheetVisible}
				onClose={() => setDeptSheetVisible(false)}
				title="Select Department"
				subtitle={`Departments under ${selectedFaculty?.name || "faculty"}`}
				items={deptItems}
				selectedId={selectedDepartmentId}
				onSelect={(item) => onSelectDepartment(item.id)}
			/>

			<SelectOptionBottomSheet
				visible={progSheetVisible}
				onClose={() => setProgSheetVisible(false)}
				title="Select Academic Program"
				subtitle={`Programs under ${selectedDept?.name || "department"}`}
				items={progItems}
				selectedId={selectedProgramId}
				onSelect={(item) => onSelectProgram(item.id)}
			/>
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
		maxWidth: 440,
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
	errorContainer: {
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 12,
		padding: 24,
		alignItems: "center",
		justifyContent: "center",
		marginVertical: 20,
	},
	errorTitle: {
		fontSize: 16,
		fontWeight: "700",
		color: colors.textMain,
		marginTop: 12,
		marginBottom: 4,
		textAlign: "center",
	},
	errorSubtitle: {
		fontSize: 13,
		color: colors.textMuted,
		textAlign: "center",
		marginBottom: 16,
		lineHeight: 18,
	},
	retryButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colors.primary,
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 8,
	},
	retryIcon: {
		marginRight: 6,
	},
	retryText: {
		fontSize: 14,
		fontWeight: "600",
		color: colors.primaryForeground,
	},
	header: {
		marginBottom: 24,
	},
	title: {
		fontSize: 26,
		fontWeight: "700",
		color: colors.textMain,
		marginBottom: 6,
	},
	subtitle: {
		fontSize: 14,
		color: colors.textMuted,
		lineHeight: 20,
	},
	loadingContainer: {
		paddingVertical: 48,
		alignItems: "center",
		justifyContent: "center",
	},
	loadingText: {
		fontSize: 14,
		color: colors.textMuted,
		marginTop: 12,
	},
	sectionHeader: {
		fontSize: 14,
		fontWeight: "700",
		color: colors.primary,
		textTransform: "uppercase",
		letterSpacing: 0.8,
		marginTop: 12,
		marginBottom: 14,
	},
	form: {
		marginBottom: 24,
	},
	selectorWrapper: {
		marginBottom: 16,
	},
	selectorLabel: {
		fontSize: 14,
		fontWeight: "500",
		color: colors.textMain,
		marginBottom: 6,
	},
	selectorButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 8,
		paddingHorizontal: 12,
		height: 48,
	},
	selectorButtonDisabled: {
		opacity: 0.5,
		backgroundColor: colors.background,
	},
	selectorButtonError: {
		borderColor: colors.danger,
	},
	selectorLeft: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
		marginRight: 8,
	},
	selectorIcon: {
		marginRight: 10,
	},
	selectorValue: {
		fontSize: 14,
		color: colors.textMain,
		fontWeight: "500",
	},
	selectorPlaceholder: {
		color: colors.textSubtle,
		fontWeight: "400",
	},
	fieldErrorText: {
		fontSize: 12,
		color: colors.danger,
		marginTop: 4,
		marginLeft: 2,
	},
	helperText: {
		fontSize: 13,
		color: colors.textSubtle,
		fontStyle: "italic",
		marginTop: 2,
	},
	levelChipsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
		marginTop: 4,
	},
	levelChip: {
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderRadius: 8,
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
		alignItems: "center",
		justifyContent: "center",
		minWidth: 64,
	},
	selectedLevelChip: {
		backgroundColor: colors.primary,
		borderColor: colors.primary,
	},
	levelChipText: {
		fontSize: 14,
		fontWeight: "600",
		color: colors.textMuted,
	},
	selectedLevelChipText: {
		color: colors.primaryForeground,
		fontWeight: "700",
	},
	submitContainer: {
		marginTop: 12,
	},
	footer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginTop: 12,
		marginBottom: 24,
	},
	footerText: {
		fontSize: 13,
		color: colors.textMuted,
	},
	signInLink: {
		color: colors.primary,
		fontWeight: "600",
		fontSize: 13,
	},
});
