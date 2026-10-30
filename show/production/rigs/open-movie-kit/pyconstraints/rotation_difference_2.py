#BPYCONSTRAINT
'''
	Sets the x translation of the constrained
	object to a number between 0 and 1.  This
	number represents the difference in
	rotation between it and the target object.
	
	* 0 means there is no difference (they are
	  in the same orientation).
	* 1 means they are 180 degrees different
	  (their orientations are as dissimilar as
	  possible).
'''

import Blender
from Blender import Draw
from Blender import Mathutils
import math

NUM_TARGETS = 1







def doConstraint(obmatrix, targetmatrix, idprop):
	rot1 = obmatrix.toQuat()
	rot2 = targetmatrix[0].toQuat()
	
	rotdif = math.fabs( Mathutils.DifferenceQuats( rot1, rot2 ).angle )
	
	if rotdif > 180:
		rotdif = 360 - rotdif
	
	obmatrix[3][0] = rotdif / 180
	
	return obmatrix







def getSettings(idprop):
	# define and draw pupblock
	block = []
	block.append("No settings")
	Draw.PupBlock("Constraint Template", block)