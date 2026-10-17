import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import 'student_dashboard_screen.dart';
import '../drafts/drafts_list_screen.dart';
import '../assignments/assignments_list_screen.dart';
import '../tutor/tutor_chat_screen.dart';
import '../profile/profile_screen.dart';

class BottomNavShell extends StatefulWidget {
  const BottomNavShell({super.key});

  @override
  State<BottomNavShell> createState() => _BottomNavShellState();
}

class _BottomNavShellState extends State<BottomNavShell> {
  int _currentIndex = 0;

  void _onTabTapped(int index) {
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      StudentDashboardScreen(onNavigateTab: _onTabTapped),
      const DraftsListScreen(),
      const AssignmentsListScreen(),
      const TutorChatScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          border: const Border(top: BorderSide(color: AppColors.border, width: 1.5)),
          boxShadow: [
            BoxShadow(
              color: AppColors.border.withOpacity(0.5),
              offset: const Offset(0, -3),
              blurRadius: 6,
            ),
          ],
        ),
        child: SafeArea(
          child: BottomNavigationBar(
            currentIndex: _currentIndex,
            onTap: _onTabTapped,
            type: BottomNavigationBarType.fixed,
            backgroundColor: AppColors.surface,
            elevation: 0,
            selectedItemColor: AppColors.primary,
            unselectedItemColor: AppColors.textMuted,
            selectedLabelStyle: AppTextStyles.bodySmall.copyWith(fontWeight: FontWeight.bold, fontSize: 11),
            unselectedLabelStyle: AppTextStyles.bodySmall.copyWith(fontSize: 10),
            items: const [
              BottomNavigationBarItem(
                icon: Icon(LucideIcons.layoutDashboard, size: 20),
                activeIcon: Icon(LucideIcons.layoutDashboard, size: 22, color: AppColors.primary),
                label: 'Studio',
              ),
              BottomNavigationBarItem(
                icon: Icon(LucideIcons.fileText, size: 20),
                activeIcon: Icon(LucideIcons.fileText, size: 22, color: AppColors.primary),
                label: 'Drafts',
              ),
              BottomNavigationBarItem(
                icon: Icon(LucideIcons.bookOpen, size: 20),
                activeIcon: Icon(LucideIcons.bookOpen, size: 22, color: AppColors.primary),
                label: 'Tasks',
              ),
              BottomNavigationBarItem(
                icon: Icon(LucideIcons.sparkles, size: 20),
                activeIcon: Icon(LucideIcons.sparkles, size: 22, color: AppColors.accent),
                label: 'AI Tutor',
              ),
              BottomNavigationBarItem(
                icon: Icon(LucideIcons.user, size: 20),
                activeIcon: Icon(LucideIcons.user, size: 22, color: AppColors.primary),
                label: 'Profile',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
