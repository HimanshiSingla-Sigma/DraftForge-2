import 'package:flutter_test/flutter_test.dart';
import 'package:draftforge_mobile/core/models/user_model.dart';
import 'package:draftforge_mobile/core/models/draft_model.dart';
import 'package:draftforge_mobile/core/models/evaluation_model.dart';
import 'package:draftforge_mobile/core/models/loophole_model.dart';
import 'package:draftforge_mobile/core/models/assignment_model.dart';
import 'package:draftforge_mobile/core/models/submission_model.dart';

void main() {
  group('DraftForge Model Deserialization Tests', () {
    test('UserModel correctly deserializes student profile', () {
      final json = {
        'id': 'usr-101',
        'email': '24llb017@ncuindia.edu',
        'role': 'STUDENT',
        'full_name': 'Rohan Verma',
      };

      final user = UserModel.fromJson(json);
      expect(user.id, 'usr-101');
      expect(user.email, '24llb017@ncuindia.edu');
      expect(user.role, 'STUDENT');
      expect(user.fullName, 'Rohan Verma');
      expect(user.isStudent, true);
      expect(user.isTeacher, false);
    });

    test('DraftModel parses versions and computes latest version number', () {
      final json = {
        'id': 'dft-555',
        'user_id': 'usr-101',
        'title': 'Commercial Non-Disclosure Agreement',
        'document_type': 'CONTRACT',
        'status': 'DRAFT',
        'versions': [
          {
            'id': 'ver-1',
            'draft_id': 'dft-555',
            'version_number': 1,
            'raw_content': 'First revision draft clause...',
          },
          {
            'id': 'ver-2',
            'draft_id': 'dft-555',
            'version_number': 2,
            'raw_content': 'Second revision draft clause with revised dispute mechanism...',
          },
        ],
      };

      final draft = DraftModel.fromJson(json);
      expect(draft.id, 'dft-555');
      expect(draft.title, 'Commercial Non-Disclosure Agreement');
      expect(draft.versions.length, 2);
      expect(draft.latestVersionNumber, 2);
      expect(draft.latestVersion?.id, 'ver-2');
    });

    test('EvaluationModel correctly calculates dimensional scores and overrides', () {
      final json = {
        'id': 'eval-777',
        'draft_version_id': 'ver-2',
        'overall_score': 84.5,
        'max_score': 100.0,
        'structure_score': 26.0,
        'clause_score': 34.5,
        'formatting_score': 24.0,
        'gap_penalty': 0.0,
        'rubric_version': '1.2',
        'llm_explanation': 'Strong covenant definitions.',
        'is_overridden': true,
        'overridden_score': 90.0,
        'evidence_items': [
          {
            'criterion': 'Confidentiality Scope',
            'category': 'CLAUSE',
            'status': 'PASS',
            'score': 10.0,
            'max_score': 10.0,
            'explanation': 'Definition of trade secrets is exhaustive.',
          }
        ],
      };

      final evaluation = EvaluationModel.fromJson(json);
      expect(evaluation.overallScore, 84.5);
      expect(evaluation.displayScore, 90.0); // Verifies override logic
      expect(evaluation.evidenceItems.length, 1);
      expect(evaluation.evidenceItems.first.isPassed, true);
    });

    test('LoopholeReportModel parses high-severity vulnerabilities', () {
      final json = {
        'evaluation_id': 'eval-777',
        'document_type': 'CONTRACT',
        'total_loopholes': 2,
        'high_severity_count': 1,
        'loopholes': [
          {
            'finding_id': 'lh-1',
            'title': 'Omission of Governing Law Jurisdiction',
            'severity': 'HIGH',
            'gap_type': 'MISSING_PREREQUISITE',
            'educational_observation': 'Arbitration clause lacks seat specification.',
            'reference_recommendation': 'Insert exclusive jurisdiction clause.',
          }
        ],
      };

      final report = LoopholeReportModel.fromJson(json);
      expect(report.totalLoopholes, 2);
      expect(report.highSeverityCount, 1);
      expect(report.loopholes.first.isHigh, true);
    });

    test('AssignmentModel and SubmissionModel deserialization', () {
      final assignJson = {
        'id': 'asn-10',
        'teacher_id': 'tch-1',
        'title': 'Draft an Indemnity Clause',
        'document_type': 'CONTRACT',
        'instructions': 'Draft third-party indemnification.',
        'status': 'ACTIVE',
      };

      final subJson = {
        'id': 'sub-99',
        'assignment_id': 'asn-10',
        'student_id': 'usr-101',
        'draft_id': 'dft-555',
        'draft_version_id': 'ver-2',
        'status': 'GRADED',
        'final_score': 88.0,
      };

      final assignment = AssignmentModel.fromJson(assignJson);
      final submission = SubmissionModel.fromJson(subJson);

      expect(assignment.title, 'Draft an Indemnity Clause');
      expect(assignment.isActive, true);
      expect(submission.isGraded, true);
      expect(submission.finalScore, 88.0);
    });
  });
}
